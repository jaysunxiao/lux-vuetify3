### CDN刷新预热

- url，可以刷新cdn缓存但是不能删除。删除任何cdn或者oss上的文件，会导致浏览器缓已经缓存的url路径失效

```
https://jiucai.fun/_redirects
https://jiucai.fun/favicon.ico
https://jiucai.fun/index.html
```

- 目录

```
https://jiucai.fun/assets/
https://jiucai.fun/config/
```

- node版本 v20.13.1