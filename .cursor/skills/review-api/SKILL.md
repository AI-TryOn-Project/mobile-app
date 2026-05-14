---
name: review-api
description: >-
  Reviews and cross-checks mobile-app API usage against the faishion-web-app HTTP
  layer (Route Handlers under app/api, Bearer mobile routes, and /api/sa-mirror).
  Use when the user asks to review APIs, audit endpoints, align mobile with backend,
  check auth (Session vs Bearer), or verify docs vs implementation for mobile clients.
---

# Review API（Mobile ↔ Web App）

Mobile 客户端只应调用 **`faishion-web-app`** 暴露的 HTTP API（含 `/api/mobile/*`、`/api/sa-mirror/*` 及其它 `HTTP_API_REFERENCE.md` 所列路径），不直接依赖 Web 的 Server Actions。

## 1. 先读文档（权威来源）

按顺序打开（路径相对 monorepo 根 `fAIshion/`，与 `mobile-app` 并列）：

1. [`faishion-web-app/docs/HTTP_API_REFERENCE.md`](../../../faishion-web-app/docs/HTTP_API_REFERENCE.md) — 全部 `app/api/**/route.ts` 分组、方法、鉴权说明。
2. [`faishion-web-app/docs/SERVER_ACTIONS_HTTP_MIRROR.md`](../../../faishion-web-app/docs/SERVER_ACTIONS_HTTP_MIRROR.md) — 非 admin Server Action 与 `/api/sa-mirror/...` 映射、Bearer `yes` / `session_only`。
3. [`mobile-app/docs/README.md`](../../../docs/README.md) — 本索引与绝对路径表。

若需产品文案或占位接口说明，再读 [`ProductandStrategy/agent_and_api_docs/mobile_app_dummy_apis.md`](../../../ProductandStrategy/agent_and_api_docs/mobile_app_dummy_apis.md)（若存在）。

## 2. 对照实现（文档有出入时以代码为准）

- 枚举路由：`faishion-web-app/app/api/**/route.ts`（可用 ripgrep `export async function (GET|POST|PATCH|DELETE)`）。
- 镜像分发：`faishion-web-app/lib/server/http-action-mirror/handle-sa-mirror-request.ts`。
- 移动 JWT：`faishion-web-app/lib/server/mobile-auth/`、`getUserIdFromSessionOrBearer` 等。

## 3. 审查 mobile-app 时的检查清单

- **Base URL**：环境变量中的 Web 域名是否与部署一致（staging/prod）。
- **鉴权**：需 Cookie 的端点不可在纯 RN 里假设；移动应使用文档标明 **Bearer（移动）** 或镜像层中 Bearer 为 `yes` 的路径。
- **501 / session_only**：`SERVER_ACTIONS_HTTP_MIRROR.md` 中 Bearer 为 `session_only` 的镜像端点，Bearer 客户端会收到 501；若产品需要，应扩展后端委托或改用已有 `/api/mobile/*` 能力。
- **变更同步**：后端若增删 `app/api` 或改变契约，应已更新 `HTTP_API_REFERENCE.md`（及镜像表）；若未更新，在审查结论中单独标出 **文档漂移**。

## 4. 输出建议

给出简要表格：**能力 / 文档路径 / HTTP 方法与路径 / 鉴权 / mobile-app 是否已对接（grep `src`）/ 风险**；对缺失或 501 的项列出后续动作（改客户端或改后端）。
