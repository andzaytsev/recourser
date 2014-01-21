import psycopg2
import re

catagory={"CW":0,"HUM":1,"COMP1":2,"CNW":3,"ACP":4,"NAT":5,"SBS":6,"QR":7}

def insert_space(course):
	course_id=course[0]
	pos = re.search("\d", course_id).start()
	return (course_id[:pos] + ' ' + course_id[pos:],course[1:])

def get_results(cur,name,n=0):
	cur.execute("select * from test where name similar to '%%%s%%' ORDER BY name;"%name.replace(" ", ""))
	result=cur.fetchall()
	if len(result)>n and n!=0:
		result=result[:n]
	if len(result)==0:
		cur.execute("select * from test where lower(description) similar to lower('%%%s%%') or lower(course_full) similar to lower('%%%s%%') ORDER BY name;"%(name,name))
		result=cur.fetchall()
		if len(result)>n and n!=0:
			result=result[:n]
	result = map(insert_space, result)
	return result

def accessing(cur,courses):
	category_credit={key:0 for key in catagory.keys()}
	category_credit["credit"]=0
	for course in courses:
		course="".join(course.split(" ")[:2])
		cur.execute("select credit_hours from test where name='%s';"%course)
		credit=int(cur.fetchall()[0][0])
		category_credit["credit"]+=credit;
		for i in catagory.keys():
			cur.execute("select catagory[%d] from test where name='%s';"%(catagory[i],course))
			if cur.fetchall()[0]==True:
				category_credit[catagory]+=credit;
	return [("credit",category_credit["credit"])]+[(i,category_credit[i]) for i in catagory]


def get_description(cur, name):
	cur.execute("select description from test where name='%s';"%name)
	return cur.fetchall()

