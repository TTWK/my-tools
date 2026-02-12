# 编码规范（Vue 小程序工程）

本规范以 Vue 官方风格指南为基线（见 [references.md](file:///d:/workspace/FROM_GITHUB/my-tools/docs/references.md)），结合小程序工程特点补充落地细则。

## 总原则

- 可读性优先：清晰命名、单一职责、避免隐式副作用
- 业务逻辑可测试：复杂逻辑必须下沉到可单测的纯函数/组合式函数
- 中文注释用于解释“为什么”和“业务含义”，不重复代码本身
- 平台 API 统一封装：禁止在 domain 层直接调用 uni/wx

## TypeScript

- 默认使用严格模式；任何绕过类型检查必须说明原因并给出替代方案
- 业务实体与输入输出使用显式类型/接口，避免 any
- domain 层禁止引入平台相关类型（wx/uni），通过 services/adapters 传递数据

## 命名与结构

- 目录：kebab-case（如 scorekeeper、storage-sync）
- 组件：PascalCase（如 ScoreboardPanel.vue）
- 组合式函数：useXxx（如 useScorekeeperGame）
- 文件内导出：优先具名导出；默认导出仅用于 Vue SFC

## 注释规范（必须）

- 关键业务规则、边界条件、异常处理路径必须有中文注释
- 注释可指向需求文档的章节（例如：参见 requirements/scorekeeper.md 的“计分规则”）
- 禁止记录敏感信息（账号、token、用户隐私）

## 错误处理

- domain：以可预期错误类型表达（例如 Result/错误码），避免直接 throw 未分类错误
- services：对平台 API 失败做统一包装，便于测试与上报
