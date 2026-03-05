# 🍽️ ChromaDish API Documentation

**Version:** 2.1.0 | **Base URL:** `[DYNAMIC_URL]` (Defaults to `http://localhost:3005` in dev)

---

## Quick Start

```bash
# Generate with franchise quality
curl -X POST http://localhost:3005/api/generate \
  -F "image=@food.jpg" \
  -F "quality=franchise" \
  -F "strictness=85"

# Or use a preset
curl -X POST http://localhost:3005/api/generate \
  -F "image=@food.jpg" \
  -F "preset=menu-hero" \
  -F "quality=franchise"
```

---

## Endpoints

### GET /
Welcome message with API info

### GET /health
Health check - verify API is running

### GET /api/docs
This documentation

### GET /api/presets
Get all available presets (perspectives, settings, brand kits, shot recipes)

---

## POST /api/generate

Generate a food photography mockup from an image.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image` | file | No* | - | Image file (JPEG/PNG) |
| `imageBase64` | string | No* | - | Base64 encoded image |
| `imageUrl` | string | No* | - | URL to image |
| `quality` | string | No | `standard` | Quality tier: `draft`, `standard`, `franchise` |
| `dishName` | string | No | `the dish` | Name of dish for franchise prompts |
| `preset` | string | No | - | Use preset (e.g., `menu-hero`) |
| `strictness` | number | No | 50 | AI adherence 0-100 |
| `brandKit` | string | No | - | Brand kit ID |
| `perspective` | string | No | - | Camera perspective |
| `setting` | string | No | - | Background/setting |
| `plating` | string | No | - | How food is served |
| `instructions` | string | No | - | Additional instructions |
| `webhookUrl` | string | No | - | URL for async callback |

*One of `image`, `imageBase64`, or `imageUrl` required.

---

## Quality Tiers

| Tier | Description | Use Case |
|------|-------------|----------|
| `draft` | Fast, basic quality | Testing/preview |
| `standard` | Good professional quality | Most use cases |
| `franchise` | National QSR campaign quality | High-end marketing |

### Franchise Quality Prompt
When `quality=franchise`, the API uses a professional franchise prompt template:
- Three-point studio lighting
- 100mm macro lens
- Commercial fast-casual franchise styling (McDonald's, Chick-fil-A, Shake Shack standards)
- Professional food styling with precise plating
- Warm, vibrant color grading
- Appetizing micro-details (steam, glaze, garnishes)

---

## Presets

### Shot Recipes
```bash
?preset=menu-hero       # Website headers, menus
?preset=social-vertical # Instagram, TikTok  
?preset=ecomm-white    # Marketplaces (Amazon, etc)
?preset=lifestyle      # Brand storytelling
```

### Brand Kits
```bash
?brandKit=rustic   # Warm, natural, wooden textures
?brandKit=minimal  # Clean, bright, modern
```

### Perspectives
```bash
?perspective=hero-shot      # Eye-level, shallow DOF
?perspective=menu-standard  # Top-down flat lay
?perspective=close-up       # Macro detail shots
```

---

## Examples

### Franchise Quality (Best Results)
```bash
curl -X POST http://localhost:3005/api/generate \
  -F "image=@burger.jpg" \
  -F "quality=franchise" \
  -F "dishName=Classic Burger" \
  -F "strictness=90" \
  -F "brandKit=rustic"
```

### Social Media Vertical
```bash
curl -X POST http://localhost:3005/api/generate \
  -F "image=@pizza.jpg" \
  -F "preset=social-vertical" \
  -F "quality=franchise" \
  -F "strictness=85"
```

### With Webhook (Async)
```bash
curl -X POST http://localhost:3005/api/generate \
  -F "image=@food.jpg" \
  -F "quality=franchise" \
  -F "webhookUrl=https://your-server.com/webhook"
```

---

## Response Format

```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "format": "png",
  "requestId": "uuid",
  "quality": "franchise",
  "preset": "menu-hero",
  "settings": {
    "strictness": 90,
    "perspective": "custom",
    "setting": "custom"
  }
}
```

---

## POST /api/batch

Generate up to 6 mockups at once.

```bash
curl -X POST http://localhost:3005/api/batch \
  -F "images=@img1.jpg" \
  -F "images=@img2.jpg" \
  -F "quality=franchise" \
  -F "preset=menu-hero"
```

---

## POST /api/upscaler

Enhance image resolution.

```bash
curl -X POST http://localhost:3005/api/upscaler \
  -F "image=@generated.png" \
  -F "scale=4"
```

---

## Brand Kit Management

### GET /api/brand-kits
List all brand kits (built-in + custom)

### POST /api/brand-kits
Create custom brand kit:
```json
{
  "name": "My Brand",
  "promptFragment": "bold colors, high contrast",
  "colorAccent": "#FF5500",
  "description": "Bold branding"
}
```

### DELETE /api/brand-kits/:id
Delete custom brand kit

---

## Error Handling

All errors include codes:

| Code | Description |
|------|-------------|
| `NO_IMAGE` | No image provided |
| `IMAGE_TOO_LARGE` | File exceeds 10MB |
| `GENERATION_ERROR` | AI generation failed |
| `QUOTA_EXCEEDED` | API rate limit |
| `WEBHOOK_FAILED` | Webhook delivery failed |

Example error:
```json
{
  "success": false,
  "error": "API quota exceeded",
  "code": "QUOTA_EXCEEDED",
  "requestId": "uuid"
}
```

---

## Retry Logic

The API automatically retries failed requests up to 3 times with exponential backoff. This handles:
- Temporary API timeouts
- Rate limiting
- Network issues

---

## Rate Limits

| Plan | Requests/min |
|------|--------------|
| Free | 10 |
| Pro | 60 |
| Enterprise | 240 |

---

## Changelog

### v2.1.0
- Added `quality` parameter (`draft`, `standard`, `franchise`)
- Added franchise-quality prompt template
- Added retry logic with exponential backoff
- Added structured logging
- Improved error handling

### v2.0.0
- Added presets support
- Added image URL input
- Added webhooks
- Added brand kit builder
- Added upscaler endpoint
