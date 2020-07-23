FROM nginx

COPY docker-entrypoint.d /docker-entrypoint.d 
COPY nginx.page.conf /etc/nginx/conf.d/default.conf
COPY dist/oeh-search-frontend/ /usr/share/nginx/html/