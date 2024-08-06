// var http = require("http");
// var url = require("url");
import http from 'http'
import URL from 'url'
import httpProxy from 'http-proxy'
const PORT = 1085

export default class Server {
    static Create3() {
        //创建一个代理服务
        const proxy = httpProxy.createProxyServer();

        //创建http服务器并监听8888端口
        let server = http.createServer(function (req, res) {
            //将用户的请求转发到本地9999端口上
            proxy.web(req, res, {
                target: 'http://www.baidu.com'
            });
            //监听代理服务错误
            proxy.on('error', function (err) {
                console.log(err);
            });
        });
        server.listen(8080, '0.0.0.0');
    }

    static Create() {
        
        const server = http.createServer()

        this._CreateLinkRquest(server)
        // server.on('request', (req, res) => {
        //     console.log(req.url)
        //     let reqBody = ''
        //     req.on('data', chunk => {
        //         reqBody += chunk
        //     })
        //     req.on('end', () => {
        //         this._CreateLinkRquest(req, res, reqBody)
        //         // res.end('Request is receive.' + req.url)
        //     })
        // })

        server.on('error', err => {
            console.error('访问代理错误', err)
        })

        server.listen(PORT, () => {
            console.log(`Server is running at port ${PORT}`)
        })
    }

    private static _CreateLinkRquest(server) {
        // 接收到客户端的请求
        server.on('request', (req, res) => {
            console.log('接收到客户端的请求', req.method, req.url, req.query)
            // 接收客户端上传的数据
            let reqBody = ''
            req.on('data', chunk => {
                reqBody += chunk
            })
            // 请求完成
            req.on('end', () => {
                // res.end('Request is receive.')
                // 读取真实的URL和请求方法
                const { url, method, host } = req
                // const host = 'www.bilibili.com'

                console.log('接收完毕，开始访问', method, url, host)
                const hh = host || 'www.bilibili.com'

                // 向目标服务器发送请求
                const proxyReq = http.request({
                    method,
                    host: hh,
                    path: url,
                }, targetRes => {
                    // 接收目标服务器的响应数据
                    let targetData = ''
                    targetRes.on('data', chunk => {
                        targetData += chunk
                        console.log('data from target server目标服务器数据: ', chunk.toString())
                    })
                    // 响应完毕，开始向客户端发送响应头和响应数据
                    targetRes.on('end', () => {
                        console.log('访问完毕', method, url)
                        res.writeHead(
                            targetRes.statusCode,
                            targetRes.statusMessage,
                            targetRes.headers
                        )
                        res.end(targetData)
                    })
                    // 监听错误
                    targetRes.on('error', err => {
                        console.error('访问服务器错误', err)
                        res.writeHead(  500, 'Proxy Error' )
                        res.end()
                    })
                })
                // 向目标服务器发送数据
                proxyReq.write(reqBody)
                // 结束向目标服务器的请求
                proxyReq.end()
                console.log('代理访问结束，rquest end.', reqBody)
            })
        })

    }


    static Create2() {
        http.createServer(function(req,res){
            console.log("start request 开始访问:",req.url);
        
            var option = URL.parse(req.url);
            option.headers = req.headers;
        
            var proxyRequest = http.request(option, function(proxyResponse){
        
                proxyResponse.on("data",function(chunk){
                    console.log("proxyResponse length",chunk.length);
                });
                proxyResponse.on("end",function(){
                    console.log("proxyed request ended");
                    res.end();
                })
        
                res.writeHead(proxyResponse.statusCode,proxyResponse.headers);
            });
        
            
            req.on("data",function(chunk){
                console.log("in request length:",chunk.length);
                proxyRequest.write(chunk,"binary");
            })
        
            req.on("end",function(){
                console.log("original request ended");
                proxyRequest.end();
            })
        
        }).listen(PORT);
        console.log('start in port' + PORT)
    }
}