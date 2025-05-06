# SSK Silks Plesk Deployment

## Deployment Instructions

1. Upload all contents to your Plesk server's document root
2. Set proper permissions:
   ```
   chmod -R 755 images
   chmod 755 start-service.sh
   ```
3. Configure Node.js in Plesk:
   - Set application mode to "production"
   - Set Node.js version to 16 or newer
   - Set start command to: `./start-service.sh`
   - Set document root to public/

4. Create a Proxy Apache/Nginx configuration in Plesk:
   - Enable the Apache module: mod_proxy, mod_proxy_http
   - The .htaccess file should handle the routing

5. Update the .env.production files with your actual credentials
6. Restart the Node.js application in Plesk

## Verifying Deployment
- Frontend: https://ssksilks.in
- API: https://ssksilks.in/api/products
- Images: https://ssksilks.in/images/products/example.jpg
