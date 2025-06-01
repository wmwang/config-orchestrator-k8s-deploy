# 使用官方 nginx 鏡像
FROM nginx:alpine

# 複製構建好的 React 應用到 nginx 的默認靜態文件目錄
COPY dist/ /usr/share/nginx/html/


# 複製自定義的 nginx 配置（可選）
 COPY nginx.conf /etc/nginx/nginx.conf

# 暴露 80 端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]