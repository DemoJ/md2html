# ---- 构建阶段 ----
FROM node:20-alpine AS builder

WORKDIR /app

# 利用缓存：先拷 package 文件，再装依赖
COPY package.json package-lock.json* ./
RUN npm ci

# 拷源码并构建
COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM nginx:alpine

# 自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 拷构建产物到 nginx 静态目录
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
