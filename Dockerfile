FROM nginx

COPY docker-entrypoint.d /docker-entrypoint.d
COPY nginx.page.conf /etc/nginx/conf.d/default.conf
COPY dist/oeh-search-frontend/browser/ /usr/share/nginx/html/search/
COPY dist/oeh-search-frontend/3rdpartylicenses.txt /usr/share/nginx/html/search/3rdpartylicenses.txt
