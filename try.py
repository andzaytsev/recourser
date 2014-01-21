import urllib2
from xml.dom import minidom
import psycopg2

# terms=["spring","fall","summer"]
# years=['2013','2014']
# for term in terms:
# 	for year in years:
# 		url="http://courses.illinois.edu/cisapp/explorer/schedule/%s/%s.xml"%(year,term)

conn = psycopg2.connect(database='d5lma8cjgovsui', 
	user='wauaapmuzoynrm', 
	password='x1c8KK5_cLbnw5aZ-25SVnRwIC', 
	host='ec2-54-197-238-242.compute-1.amazonaws.com', 
	port='5432')
cur = conn.cursor()

conn.commit()

cur.execute("CREATE TABLE test (\
			name TEXT PRIMARY KEY NOT NULL,\
			subject TEXT NOT NULL,\
			subject_full TEXT NOT NULL,\
			course_full TEXT NOT NULL,\
			description TEXT NOT NULL,\
			credit_hours INT,\
			catagory BOOLEAN[8] DEFAULT ARRAY[false,false,false,false,false,false,false,false]\
			);")

catagory={"CW":0,"HUM":1,"COMP1":2,"CNW":3,"ACP":4,"NAT":5,"SBS":6,"QR":7}

u=urllib2.urlopen('http://courses.illinois.edu/cisapp/explorer/schedule/2013/spring.xml')

dom_sub=minidom.parse(u)
for node_sub in dom_sub.getElementsByTagName("subject"):
	subjectShort=node_sub.attributes["id"].value
	subjecturl=node_sub.attributes["href"].value
	subjectName=node_sub.firstChild.data.replace("'","")
	try:
		dom_course=minidom.parse(urllib2.urlopen(subjecturl))
		for node_course in dom_course.getElementsByTagName("course"):
			courseId=node_course.attributes["id"].value
			courseurl=node_course.attributes["href"].value
			courseFullName=node_course.firstChild.data.replace("'","")
			try:
				dom_description=minidom.parse(urllib2.urlopen(courseurl))
				print subjectShort+courseId
				courseDescription=dom_description.getElementsByTagName("description")[0].firstChild.data.replace("'","")
				credit_hours=dom_description.getElementsByTagName("creditHours")[0].firstChild.data.split(" ")[0]
				# print 'INSERT INTO test (name,subject,subject_full,course_full,description)\
				#  VALUES ("%s","%s","%s","%s","%s")'%(subjectShort+courseId, subjectShort, courseFullName,subjectName,courseDescription)
				cur.execute("INSERT INTO test (name,subject,subject_full,course_full,description,credit_hours)\
					 VALUES ('%s','%s','%s','%s','%s',%s);"%(subjectShort+courseId, subjectShort, courseFullName,subjectName,courseDescription,credit_hours))
				for node_cat in dom_description.getElementsByTagName("catagory"):
					cat=node_cat.attributes["id"].value
					cur.execute("UPDATE test SET catagory[%s]=true WHERE name='%s';"%(str(catagory[cat]),subjectShort+courseId))
			except:
				print courseurl
	except Exception, e:
		print subjecturl

conn.commit()
cur.close()
conn.close()
