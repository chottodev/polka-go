(function () {
  const app = document.getElementById("app");
  const path = location.pathname.replace(/\/+$/, "") || "/";

  const FONT_OPTIONS = [
    ["system", "Системный"],
    ["arial", "Arial"],
    ["helvetica", "Helvetica"],
    ["segoe", "Segoe UI"],
    ["verdana", "Verdana"],
    ["tahoma", "Tahoma"],
    ["trebuchet", "Trebuchet MS"],
    ["georgia", "Georgia"],
    ["times", "Times New Roman"],
    ["palatino", "Palatino"],
    ["garamond", "Garamond"],
    ["courier", "Courier New"],
    ["lucida", "Lucida Console"],
    ["impact", "Impact"],
    ["comic", "Comic Sans MS"],
  ];

  const SIZE_OPTIONS = [16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512];

  const VECTOR_KINDS = [
    ["man", "Мужской"],
    ["female", "Женский"],
    ["male", "Male (простой)"],
    ["cat", "Cat"],
    ["dog", "Dog"],
    ["panda", "Panda"],
    ["fox", "Fox"],
  ];

  const PALETTE_OPTIONS = [
    ["soft", "Soft"],
    ["vivid", "Vivid"],
    ["earth", "Earth"],
    ["mono", "Mono"],
    ["ocean", "Ocean"],
  ];

  document.querySelectorAll("nav a[data-tab]").forEach((a) => {
    if (path === "/" + a.dataset.tab || (path === "/" && a.dataset.tab === "wxh")) {
      a.classList.add("active");
    }
  });

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function optionsHtml(pairs, selected) {
    return pairs
      .map(([value, label]) => {
        const sel = String(value) === String(selected) ? " selected" : "";
        return `<option value="${value}"${sel}>${label}</option>`;
      })
      .join("");
  }

  function stripHash(hex) {
    return String(hex || "").trim().replace(/^#/, "");
  }

  function qs(obj) {
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== "" && v != null) p.set(k, String(v));
    });
    const s = p.toString();
    return s ? "?" + s : "";
  }

  async function copy(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = "Скопировано";
        setTimeout(() => { btn.textContent = prev; }, 1600);
      }
    } catch (_) {
      prompt("URL", text);
    }
  }

  function bindUrlBar(root, getUrl) {
    const urlInput = root.querySelector("#url");
    const copyBtn = root.querySelector("#copy");
    const openBtn = root.querySelector("#open");
    function sync() {
      urlInput.value = location.origin + getUrl();
    }
    copyBtn.addEventListener("click", () => {
      const v = urlInput.value.trim() || location.origin + getUrl();
      copy(v, copyBtn);
    });
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        const v = urlInput.value.trim() || location.origin + getUrl();
        window.open(v, "_blank", "noopener,noreferrer");
      });
    }
    return { urlInput, sync };
  }

  function renderWxh() {
    const root = el(`
      <section>
        <h1>WxH</h1>
        <p class="lead">Конструктор SVG-плейсхолдера по ширине и высоте.</p>
        <div class="layout">
          <form class="form" id="f">
            <div class="row">
              <label>Ширина <input name="w" type="number" value="400" min="1"/></label>
              <label>Высота <input name="h" type="number" value="300" min="1"/></label>
            </div>
            <label class="check"><input name="usePath" type="checkbox"/> Текст в пути URL</label>
            <label id="textLabel">Текст (query) <input name="text" value=""/></label>
            <div class="row">
              <label>Фон bg <input name="bg" value="cccccc" placeholder="cccccc"/></label>
              <label>Текст fg <input name="fg" value="333333" placeholder="333333"/></label>
            </div>
            <div class="row">
              <label>Скругление <input name="rounded" type="number" value="0" min="0"/></label>
              <label>Шрифт px <input name="font" type="number" value="" min="1" placeholder="авто"/></label>
            </div>
            <label>Гарнитура
              <select name="family">
                <option value="">по умолчанию (arial)</option>
                ${optionsHtml(FONT_OPTIONS, "")}
              </select>
            </label>
            <label>Градиент (h|v-c1-c2) <input name="gradient" placeholder="h-1f2937-374151"/></label>
            <div class="actions">
              <button type="submit">Применить</button>
            </div>
          </form>
          <div class="aside">
            <div class="url-row">
              <label>Итоговый URL <input id="url" class="mono" readonly/></label>
              <div class="actions">
                <button type="button" class="secondary" id="copy">Копировать</button>
                <button type="button" class="secondary" id="open">Открыть</button>
              </div>
            </div>
            <div class="preview"><img id="img" alt="preview"/></div>
          </div>
        </div>
      </section>`);
    app.replaceChildren(root);
    const form = root.querySelector("#f");
    const img = root.querySelector("#img");
    const textLabel = root.querySelector("#textLabel");
    const textInput = form.querySelector('[name="text"]');

    function buildPath() {
      const fd = new FormData(form);
      const w = fd.get("w");
      const h = fd.get("h");
      const usePath = form.usePath.checked;
      const text = String(fd.get("text") || "");
      let p = `/wxh/${w}/${h}`;
      if (usePath && text !== "") {
        p += "/" + encodeURIComponent(text).replace(/%20/g, "+");
      }
      return p + qs({
        text: usePath ? "" : text,
        bg: stripHash(fd.get("bg")),
        fg: stripHash(fd.get("fg")),
        rounded: Number(fd.get("rounded")) > 0 ? fd.get("rounded") : "",
        font: fd.get("font"),
        family: fd.get("family"),
        gradient: String(fd.get("gradient") || "").trim(),
      });
    }

    const bar = bindUrlBar(root, buildPath);
    function refresh() {
      const url = buildPath();
      img.src = url;
      bar.sync();
    }
    form.usePath.addEventListener("change", () => {
      textLabel.firstChild.textContent = form.usePath.checked
        ? "Текст (в пути) "
        : "Текст (query) ";
      if (form.usePath.checked && !textInput.value) textInput.value = "Hello";
      refresh();
    });
    form.addEventListener("submit", (e) => { e.preventDefault(); refresh(); });
    form.addEventListener("change", refresh);
    refresh();
  }

  function renderAvatars() {
    const root = el(`
      <section>
        <h1>Аватары</h1>
        <p class="lead">Два режима: по инициалам и векторные пресеты.</p>
        <div class="layout">
          <form class="form" id="f">
            <div class="segmented" role="group" aria-label="Режим">
              <button type="button" class="seg active" data-mode="initials">По инициалам</button>
              <button type="button" class="seg" data-mode="vector">Векторные</button>
            </div>
            <input type="hidden" name="mode" value="initials"/>

            <div class="row">
              <label>Размер
                <select name="size">${optionsHtml(SIZE_OPTIONS.map((n) => [n, String(n)]), 256)}</select>
              </label>
              <label>Палитра
                <select name="palette">${optionsHtml(PALETTE_OPTIONS, "soft")}</select>
              </label>
            </div>
            <div class="row">
              <label>bg (hex) <input name="bg" value="" placeholder="из палитры"/></label>
              <label>fg (hex) <input name="fg" value="" placeholder="из палитры"/></label>
            </div>

            <div id="initialsFields">
              <label>Инициалы <input name="initials" value="AB" maxlength="3"/></label>
              <div class="row">
                <label>Гарнитура
                  <select name="family">${optionsHtml(FONT_OPTIONS, "arial")}</select>
                </label>
                <label>font (px) <input name="font" type="number" min="1" placeholder="авто"/></label>
              </div>
            </div>

            <div id="vectorFields" hidden>
              <div class="row">
                <label>Тип (kind)
                  <select name="kind">${optionsHtml(VECTOR_KINDS, "man")}</select>
                </label>
                <label>Форма
                  <select name="style">
                    <option value="round" selected>Round</option>
                    <option value="square">Square</option>
                  </select>
                </label>
              </div>
            </div>

            <label>seed (опционально) <input name="seed" value=""/></label>
            <div class="actions">
              <button type="submit">Применить</button>
            </div>
          </form>
          <div class="aside">
            <div class="url-row">
              <label>Итоговый URL <input id="url" class="mono" readonly/></label>
              <div class="actions">
                <button type="button" class="secondary" id="copy">Копировать</button>
                <button type="button" class="secondary" id="open">Открыть</button>
              </div>
            </div>
            <div class="preview"><img id="img" alt="preview"/></div>
          </div>
        </div>
      </section>`);
    app.replaceChildren(root);
    const form = root.querySelector("#f");
    const img = root.querySelector("#img");
    const modeInput = form.querySelector('[name="mode"]');
    const initialsFields = root.querySelector("#initialsFields");
    const vectorFields = root.querySelector("#vectorFields");

    function setMode(mode) {
      modeInput.value = mode;
      root.querySelectorAll(".seg").forEach((b) => {
        b.classList.toggle("active", b.dataset.mode === mode);
      });
      initialsFields.hidden = mode !== "initials";
      vectorFields.hidden = mode !== "vector";
    }

    root.querySelectorAll(".seg").forEach((btn) => {
      btn.addEventListener("click", () => {
        setMode(btn.dataset.mode);
        refresh();
      });
    });

    function buildPath() {
      const fd = new FormData(form);
      const mode = fd.get("mode");
      const common = {
        size: fd.get("size"),
        palette: fd.get("palette"),
        bg: stripHash(fd.get("bg")),
        fg: stripHash(fd.get("fg")),
        seed: String(fd.get("seed") || "").trim(),
      };
      if (mode === "vector") {
        const kind = fd.get("kind") || "man";
        return `/avatars/vector/${encodeURIComponent(kind)}` + qs({
          ...common,
          style: fd.get("style") || "round",
        });
      }
      const text = encodeURIComponent(String(fd.get("initials") || "AB").slice(0, 3));
      return `/avatars/initials/${text}` + qs({
        ...common,
        family: fd.get("family"),
        font: fd.get("font"),
      });
    }

    const bar = bindUrlBar(root, buildPath);
    function refresh() {
      const url = buildPath();
      // cache-bust preview only (URL bar stays clean)
      img.src = url + (url.includes("?") ? "&" : "?") + "_ts=" + Date.now();
      bar.sync();
    }
    form.addEventListener("submit", (e) => { e.preventDefault(); refresh(); });
    form.addEventListener("change", refresh);
    form.addEventListener("input", refresh);
    setMode("vector");
    refresh();
  }

  function renderStock() {
    const root = el(`
      <section>
        <h1>Сток</h1>
        <p class="lead">Поиск Freepik (нужен FREEPIK_API_KEY). При сбое — заглушка.</p>
        <div class="layout">
          <form class="form" id="f">
            <label>Ключевое слово <input name="query" value="кафе"/></label>
            <div class="row">
              <label>Ширина <input name="w" type="number" value="640" min="1"/></label>
              <label>Высота <input name="h" type="number" value="360" min="1"/></label>
            </div>
            <div class="row">
              <label>fit
                <select name="fit">
                  <option value="cover" selected>cover</option>
                  <option value="contain">contain</option>
                  <option value="inside">inside</option>
                </select>
              </label>
              <label>format
                <select name="format">
                  <option value="webp" selected>webp</option>
                  <option value="jpeg">jpeg</option>
                  <option value="png">png</option>
                </select>
              </label>
            </div>
            <div class="row">
              <label>quality <input name="quality" type="number" value="82" min="1" max="100"/></label>
              <label>seed <input name="seed" value=""/></label>
            </div>
            <div class="actions">
              <button type="submit">Применить</button>
            </div>
          </form>
          <div class="aside">
            <div class="url-row">
              <label>Итоговый URL <input id="url" class="mono"/></label>
              <div class="actions">
                <button type="button" class="secondary" id="copy">Копировать</button>
                <button type="button" class="secondary" id="open">Открыть</button>
              </div>
            </div>
            <div class="preview"><img id="img" alt="preview"/></div>
            <p class="hint" id="hint">Нажмите «Применить» для превью</p>
          </div>
        </div>
      </section>`);
    app.replaceChildren(root);
    const form = root.querySelector("#f");
    const img = root.querySelector("#img");
    const hint = root.querySelector("#hint");
    const urlInput = root.querySelector("#url");

    function buildPath() {
      const fd = new FormData(form);
      const q = encodeURIComponent(String(fd.get("query") || "").trim() || "кафе");
      return `/stock/${fd.get("w")}/${fd.get("h")}/${q}` + qs({
        fit: fd.get("fit"),
        format: fd.get("format"),
        quality: fd.get("quality"),
        seed: String(fd.get("seed") || "").trim(),
        provider: "freepik",
      });
    }

    function syncUrl() {
      urlInput.value = location.origin + buildPath();
    }

    root.querySelector("#copy").addEventListener("click", () => {
      copy(urlInput.value.trim() || location.origin + buildPath(), root.querySelector("#copy"));
    });
    root.querySelector("#open").addEventListener("click", () => {
      window.open(urlInput.value.trim() || location.origin + buildPath(), "_blank", "noopener,noreferrer");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const pathUrl = buildPath();
      syncUrl();
      img.src = pathUrl + (pathUrl.includes("?") ? "&" : "?") + "_=" + Date.now();
      hint.textContent = "";
    });
    form.addEventListener("change", syncUrl);
    form.addEventListener("input", syncUrl);
    syncUrl();
  }

  if (path === "/" || path === "/wxh") renderWxh();
  else if (path === "/avatars") renderAvatars();
  else if (path === "/stock") renderStock();
  else renderWxh();
})();
