# 架构总览

## 目标

- 工具聚合：每个工具（feature）可独立迭代、低耦合接入
- 离线可用：核心能力不依赖网络
- 可测试：domain 与 services 可被完整覆盖

## 分层与依赖方向

- features → domain
- features → services
- services → adapters（封装 uni/wx）
- domain 不允许依赖 features/services/adapters

## 目录建议（会在代码中落地）

- src/apps：应用壳（入口、路由/页面注册、全局错误处理）
- src/features：功能模块（按工具划分）
- src/domain：纯业务模型与规则
- src/services：存储、同步、反馈等对外依赖
- src/ui：基础组件库
