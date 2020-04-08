FROM nginx

COPY dist/open-edu-hub-frontend/ /usr/share/nginx/html/
COPY nginx.page.conf /etc/nginx/conf.d/default.conf
