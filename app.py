import os
import psycopg2
import utilities
import os
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

conn =  psycopg2.connect(database='d5lma8cjgovsui',\
                            user='wauaapmuzoynrm', \
                            password='x1c8KK5_cLbnw5aZ-25SVnRwIC',\
                            host='ec2-54-197-238-242.compute-1.amazonaws.com',\
                            port='5432')
cur = conn.cursor()

@app.route('/_search')
def search():
    query = request.args.get('query').upper()
    resp = utilities.get_results(cur, query)  
    flat_list = []
    for a_tuple in resp:
        flat_list.append(str(a_tuple[0]) + ' - ' + str(a_tuple[1][1]))
    return jsonify(result='@'.join(map(str, flat_list)))

@app.route('/')
def hello():
    return render_template('mhacks.html')

@app.route('/_access')
def access():
    query=request.args.get('query')
    query=query.split(",") if query else ""
    resp=utilities.accessing(cur,query)
    return jsonify(result='@'.join(map((lambda x:x[0]+"@"+str(x[1])),resp)))

@app.route('/_desc')
def desc():
    query=request.args.get('query').upper()
    resp=utilities.get_description(cur,query)
    return jsonify(result='@'.join(map(lambda x:x[0], resp)))

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.debug = True
    app.run(host='0.0.0.0', port=port)
    cur.close()
    conn.close()
