# PHP 8.2 + Apache
FROM php:8.2-apache

# PDO MySQL yükle
RUN docker-php-ext-install pdo pdo_mysql

# mod_rewrite aktif
RUN a2enmod rewrite

# Çalışma dizini (container içinde)
WORKDIR /var/www/html

# Kodları kopyala (lokaldeki her şeyi container içine)
COPY . /var/www/html

# Apache ayarını override et
COPY ./apache.conf /etc/apache2/sites-available/000-default.conf

# İzinler
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Port 80 expose
EXPOSE 80

# Başlat
CMD ["apache2-foreground"]