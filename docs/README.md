# 项目文档（持续更新）

本目录用于沉淀本项目的规范、架构设计与需求文档，作为开发与评审的唯一事实来源（Single Source of Truth）。

## 目录结构

- standards：工程规范（编码/组件/测试等）
- architecture：架构设计（目录分层、数据流、存储与同步等）
- requirements：需求文档（按功能模块归档）
- references.md：外部参考资料与进阶学习路径

## 开发流程约定（TDD）

1. 每个功能模块开发前先补齐 requirements 文档并评审确认
2. 先写测试（单元/集成/E2E）再实现
3. 完成后更新根目录 TODO.md 与 opencode 复盘记录
