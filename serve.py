'''
Run a local HTTP server for the benchmark.
'''
from BaseHTTPServer import HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

class BenchHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path in ('/', '/index.html'):
            self.path = '/runners/browser/index.html'
        return SimpleHTTPRequestHandler.do_GET(self)        

if __name__ == '__main__':
    httpd = HTTPServer( ('', 8000), BenchHandler)
    print "Serving on %s:%s" % (httpd.server_name, httpd.server_port)
    httpd.serve_forever()