# 🔒 保护 .env 文件 - 完全指南

## ✅ 已完成的安全措施

### 1. 从 Git 追踪中移除 .env

```bash
# 移除 backend/.env 从 Git 追踪（保留本地文件）
git rm --cached backend/.env
```

**重要**：这个命令：
- ✅ 从 Git 中移除文件追踪
- ✅ 保留本地文件不被删除
- ❌ **不会**删除历史记录中的文件

### 2. .gitignore 已配置

你的 `.gitignore` 已正确配置：
```gitignore
.env
.env.*
!.env.example
```

这会忽略：
- ✅ 根目录的 `.env`
- ✅ 任何 `.env.xxx` 文件
- ✅ `backend/.env` (匹配 `.env` 模式)
- ❌ 但保留 `.env.example` (可以提交)

---

## ⚠️ 重要：清理 Git 历史

**如果你已经 push 过包含 API key 的 commit**，那么 API key 仍然在 Git 历史中！

### 检查是否已经 push

```bash
# 查看是否有 remote
git remote -v

# 检查是否已 push
git log --all --oneline -- backend/.env | head -5
```

### 如果已经 push 到远程仓库

**必须立即**：

1. **撤销暴露的 API key**
   - 去 https://platform.deepseek.com
   - 删除旧的 API key
   - 创建新的 API key
   - 更新 `backend/.env`

2. **清理 Git 历史** (高级操作，小心！)

```bash
# 方法 1: 使用 BFG Repo-Cleaner (推荐)
# 安装 BFG
brew install bfg

# 清理 .env 文件
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 强制推送
git push --force
```

```bash
# 方法 2: 使用 git filter-branch (原生但慢)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

git push --force
```

⚠️ **警告**：这些操作会重写 Git 历史！协作者需要重新 clone 仓库。

---

## 📝 提交当前更改

现在可以安全地提交移除追踪的变更：

```bash
# 查看状态
git status

# 应该看到：
# deleted:    backend/.env

# 提交
git add .gitignore
git commit -m "security: remove .env from git tracking"

# Push (如果需要)
git push
```

---

## 🔐 最佳实践

### 1. 永远不要提交的文件
```
.env
.env.local
.env.production
*.pem
*.key
secrets.json
credentials.yaml
```

### 2. 可以提交的文件
```
.env.example
.env.template
README.md (说明如何配置)
```

### 3. 检查清单

在每次 commit 前：
```bash
# 检查是否意外暂存了敏感文件
git status | grep -i "env\|secret\|key\|password"

# 查看即将提交的内容
git diff --cached

# 如果发现敏感信息
git reset backend/.env  # 取消暂存
```

---

## 🛡️ 预防措施

### Git Hooks (自动检查)

创建 `.git/hooks/pre-commit`：

```bash
#!/bin/bash
# 检查是否试图提交 .env 文件

if git diff --cached --name-only | grep -qE '\.env$|\.env\..*$' | grep -v '\.env\.example'; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "Files:"
    git diff --cached --name-only | grep -E '\.env$|\.env\..*$' | grep -v '\.env\.example'
    echo ""
    echo "Run: git reset <filename>"
    exit 1
fi
```

```bash
# 使其可执行
chmod +x .git/hooks/pre-commit
```

### Git Secrets (工具)

```bash
# 安装
brew install git-secrets

# 配置
git secrets --install
git secrets --register-aws

# 添加自定义规则
git secrets --add 'DEEPSEEK_API_KEY.*sk-[a-zA-Z0-9]+'
git secrets --add 'sk-[a-zA-Z0-9]{30,}'
```

---

## 📊 验证安全性

```bash
# 1. 确认 .env 不在追踪中
git ls-files | grep "\.env$"
# 应该为空（或只有 .env.example）

# 2. 确认 .gitignore 工作
git check-ignore backend/.env
# 应该输出: backend/.env

# 3. 检查历史中的敏感信息
git log --all --full-history --source -- backend/.env
# 查看所有涉及的 commit

# 4. 扫描整个历史
git grep "sk-" $(git rev-list --all)
# 搜索可能的 API key 泄露
```

---

## 🚨 如果 API Key 已泄露

1. **立即撤销 key**
2. **创建新 key**  
3. **清理 Git 历史**
4. **强制推送**
5. **通知协作者**

---

## 📚 相关文档

- GitHub: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
