import os
import shlex
import json
import subprocess
import sys
from logging import getLogger, StreamHandler

logger = getLogger("bench")
logger.addHandler(StreamHandler(sys.stderr))

class Benchmarker(object):
    
    def __init__(self, basedir, config=None):
        self._basedir = basedir
        if config is None:
            config = self.load_config()
        self._config = config
    
    def load_config(self, path=None):
        if path is None:
            path = os.path.join(self._basedir, "bench_config.json") 
        data = json.load(open(path, "r"))
        for engine in data["engines"].itervalues():
            engine["lib"] = engine["lib"].format(basedir=self._basedir)
        return data

    def get_vm(self, name):
        if not isinstance(name, basestring):
            return name
        return self._config["environments"][name]

    def get_engine(self, name):
        if not isinstance(name, basestring):
            return name
        return self._config["engines"][name]
    
    @property
    def _inputdir(self):
        return self._config["inputdir"].format(basedir=self._basedir)

    @property
    def _runner(self):
        return self._config["main_runner"].format(basedir=self._basedir)
    
    def run_engine(self, vm_name, engine_name):
        vm = self.get_vm(vm_name)
        engine = self.get_engine(engine_name)
        results = []
        suite = {
            "engine": engine_name,
            "results": results
        }
        for test in self._config["syntaxes"][engine["syntax"]]["tests"]:
            results.append(self.run(vm, engine, test))
        return suite
    
    def run_all(self, vm):
        suite = []
        vm = self.get_vm(vm)
        for engine in self._config["engines"].keys():
            suite.append(self.run_engine(vm, engine))
        return suite

    def run(self, vm_name, engine_name, name):
        vm = self.get_vm(vm_name)
        engine = self.get_engine(engine_name)

        cmd = vm["command"].format(self._runner)
        cmd = shlex.split(cmd.encode('ascii'))        
        bench_path = os.path.join(self._inputdir, "{}.{}".format(name, engine["syntax"]))

        if not os.path.isfile(bench_path):
            raise Exception("Input file {!r} not availble".format(bench_path))
        process = subprocess.Popen(cmd,
                                   shell=False, 
                                   stdin=subprocess.PIPE,
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE) 
        in_ = json.dumps({"benchmark": name, 
                          "path": bench_path, 
                          "engine": engine, 
                          "basedir": self._basedir, 
                          "inputdir": self._inputdir})
        out, err = process.communicate(in_)
        if err:
            logger.warn("Benchmark could have errors")
            print >> sys.stderr, err
        return json.loads(out)

if __name__ == '__main__':
    basedir = os.path.abspath(os.path.dirname(__file__))
    b = Benchmarker(basedir)
    print >> sys.stdout, json.dumps(b.run_all("nodejs"), indent=2)
    
    
    