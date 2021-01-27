# ---- Dependencies image ----
FROM hmctspublic.azurecr.io/base/node:12-alpine as base

# ---- Runtime image ----
FROM base as runtime
COPY . .
EXPOSE 3000
