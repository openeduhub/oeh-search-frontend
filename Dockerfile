FROM nginx

COPY dist/oeh-search-frontend/ /usr/share/nginx/html/
COPY nginx.page.conf /etc/nginx/conf.d/default.conf
