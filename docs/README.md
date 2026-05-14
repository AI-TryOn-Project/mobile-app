# Mobile App 文档

## 后端 HTTP / API 文档位置（Web App）

本仓库（`mobile-app`）的接口均通过 **`faishion-web-app`** 的 Next.js Route Handlers 与镜像层提供，**以后端仓库中的 Markdown 为准**。

| 文档 | 仓库内路径（相对 monorepo 根 `fAIshion/`） | 本机绝对路径 |
|------|---------------------------------------------|--------------|
| **HTTP Route 总表**（`/api/*` 常规路由） | [`faishion-web-app/docs/HTTP_API_REFERENCE.md`](../faishion-web-app/docs/HTTP_API_REFERENCE.md) | `/Users/harvey/Desktop/MY_project/fAIshion/faishion-web-app/docs/HTTP_API_REFERENCE.md` |
| **Server Action 镜像层**（`/api/sa-mirror/*`，与 `actions.ts` 对照） | [`faishion-web-app/docs/SERVER_ACTIONS_HTTP_MIRROR.md`](../faishion-web-app/docs/SERVER_ACTIONS_HTTP_MIRROR.md) | `/Users/harvey/Desktop/MY_project/fAIshion/faishion-web-app/docs/SERVER_ACTIONS_HTTP_MIRROR.md` |
| **产品侧 / 移动端占位说明**（若存在） | [`ProductandStrategy/agent_and_api_docs/mobile_app_dummy_apis.md`](../ProductandStrategy/agent_and_api_docs/mobile_app_dummy_apis.md) | `/Users/harvey/Desktop/MY_project/fAIshion/ProductandStrategy/agent_and_api_docs/mobile_app_dummy_apis.md` |

实现代码入口（排查路由时）：

- 常规 API：`faishion-web-app/app/api/**/route.ts`
- 镜像层：`faishion-web-app/app/api/sa-mirror/[[...saPath]]/route.ts` + `faishion-web-app/lib/server/http-action-mirror/`

维护约定见 `faishion-web-app` 仓库内 `.cursor/rules/faishion-web-api-docs.mdc`。
