'use strict';

const { stockQueryParams } = require('../../../../lib/stockQueryParams');

module.exports = function stockRoute(
  config,
  generatePlaceholder,
  stockCache,
  stockResize,
  stockFreepik,
  stockFallback,
) {
  async function GET(req, res) {
    const requestStartedAt = Date.now();
    const requestId = `stock-${requestStartedAt}-${Math.random().toString(36).slice(2, 8)}`;
    let result = 'unknown';
    let query = '';

    console.info('[stock] request start', {
      requestId,
      path: req.path,
      queryParams: req.query,
    });

    try {
      const w = Number(req.params.width);
      const h = Number(req.params.height);
      if (!Number.isInteger(w) || w < 1 || w > config.stockMaxWidth) {
        result = 'invalid_width';
        return res.status(400).json({ error: 'Неверная ширина' });
      }
      if (!Number.isInteger(h) || h < 1 || h > config.stockMaxHeight) {
        result = 'invalid_height';
        return res.status(400).json({ error: 'Неверная высота' });
      }

      const provider = String(req.query.provider || 'freepik').toLowerCase();
      if (provider !== 'freepik') {
        result = 'invalid_provider';
        return res.status(400).json({ error: 'Неверный provider' });
      }

      const fit = stockResize.normalizeFit(req.query.fit || 'cover');
      const format = stockResize.normalizeFormat(req.query.format, config.stockDefaultFormat);
      const qNum = Number(req.query.quality);
      const quality = Number.isFinite(qNum) ? Math.max(1, Math.min(100, Math.round(qNum))) : config.stockDefaultQuality;
      const seed = String(req.query.seed || '').trim();
      query = decodeURIComponent(req.params.query || '').trim();
      if (!query) {
        result = 'empty_query';
        return res.status(400).json({ error: 'Пустой запрос поиска' });
      }

      await stockCache.ensureCacheDir(config.stockCacheDir);

      const cacheKey = stockCache.buildCacheKey({
        provider,
        query,
        width: w,
        height: h,
        fit,
        format,
        quality,
        seed,
      });
      const hit = await stockCache.readCachedFile(config.stockCacheDir, cacheKey, format);
      if (hit) {
        result = 'cache_hit';
        res.setHeader('Content-Type', `image/${format}`);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(hit.body);
      }

      let outputBuffer;
      let outputFormat = format;
      const providerStartedAt = Date.now();
      try {
        const picked = await stockFreepik.fetchFreepikImage({
          apiKey: config.freepikApiKey,
          query,
          seed,
          width: w,
          height: h,
          timeoutMs: config.stockProviderTimeoutMs,
        });
        const resized = await stockResize.resizeImage(picked.original, {
          width: w,
          height: h,
          fit,
          format,
          quality,
          defaultFormat: config.stockDefaultFormat,
        });
        outputBuffer = resized.output;
        outputFormat = resized.format;
        result = 'freepik_ok';
        console.info('[stock] freepik ok', {
          requestId,
          query,
          width: w,
          height: h,
          orientation: picked.orientation,
          format: outputFormat,
          resourceId: picked.resourceId,
          elapsedMs: Date.now() - providerStartedAt,
        });
      } catch (_err) {
        console.warn('[stock] freepik fallback', {
          requestId,
          query,
          width: w,
          height: h,
          format,
          elapsedMs: Date.now() - providerStartedAt,
          reason: _err && _err.message ? _err.message : 'unknown',
        });
        const fallbackSvg = stockFallback.createFallbackSvg({
          width: w,
          height: h,
          text: config.stockFallbackText || 'no image',
          generatePlaceholder,
          maxWidth: config.stockMaxWidth,
          maxHeight: config.stockMaxHeight,
        });
        const resizedFallback = await stockResize.resizeImage(Buffer.from(fallbackSvg), {
          width: w,
          height: h,
          fit,
          format,
          quality,
          defaultFormat: config.stockDefaultFormat,
        });
        outputBuffer = resizedFallback.output;
        outputFormat = resizedFallback.format;
        result = 'fallback';
      }

      await stockCache.writeCachedFile(config.stockCacheDir, cacheKey, outputFormat, outputBuffer);
      res.setHeader('Content-Type', `image/${outputFormat}`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(outputBuffer);
    } catch (err) {
      result = 'error';
      console.error('[stock] request error', {
        requestId,
        query,
        message: err && err.message ? err.message : 'unknown',
      });
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Ошибка обработки stock-запроса' });
      }
      return undefined;
    } finally {
      console.info('[stock] request end', {
        requestId,
        query,
        statusCode: res.statusCode,
        result,
        elapsedMs: Date.now() - requestStartedAt,
      });
    }
  }

  GET.apiDoc = {
    tags: ['Stock'],
    summary: 'Стоковая картинка по ключевому слову',
    operationId: 'getStockImage',
    parameters: [
      {
        name: 'width',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1, maximum: 32000 },
      },
      {
        name: 'height',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1, maximum: 32000 },
      },
      {
        name: 'query',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
      ...stockQueryParams,
    ],
    responses: {
      200: {
        description: 'Картинка',
        content: {
          'image/webp': { schema: { type: 'string', format: 'binary' } },
          'image/jpeg': { schema: { type: 'string', format: 'binary' } },
          'image/png': { schema: { type: 'string', format: 'binary' } },
        },
      },
      400: {
        description: 'Неверные параметры',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      },
    },
    'x-express-openapi-disable-response-validation-middleware': true,
  };

  return { GET };
};
