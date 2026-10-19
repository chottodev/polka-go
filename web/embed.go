package web

import "embed"

// Static holds the UI assets served by the HTTP server.
//
//go:embed static/*
var Static embed.FS
