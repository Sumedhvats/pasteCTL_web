FROM node                                                                  
WORKDIR /frontend
COPY . .
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN npm install --legacy-peer-deps
RUN npm run build
EXPOSE 3000
CMD ["npm","run","start"]
