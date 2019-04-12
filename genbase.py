#!/usr/bin/env python3

import sys, mysql.connector


mydb = mysql.connector.connect(
  host = "z1r7p1",
  database = "forum",
  user = "root",
  passwd = "root"
)

def main():
	mycursor = mydb.cursor()
	mycursor.execute('SELECT MAX(id) FROM topic')
	i = mycursor.fetchall()[0][0]
	#if type(i) == None:
	if i == None:
		i = 1
	else:
		i += 1
	print(sys.argv)
	m = int(sys.argv[2]) + i
	author_id = sys.argv[1]
	while i < m:
		mycursor.execute("INSERT INTO `topic` (`id`, `author_id`, `date_created`, `status`, `title`) VALUES ('" + str(i) + "', '" + author_id + "', '2019-02-15', '0', 'INSERTED WITH PYTHON SCRIPT (TITLE)')")
		mycursor.execute("INSERT INTO `msg` (`author_id`, `date`, `text`, `topic_id`) VALUES ('" + author_id + "', CURRENT_TIMESTAMP, 'INSERTED WITH PYTHON SCRIPT (TEXT)', '" + str(i) + "')")
		i +=1
	mydb.commit()

if __name__ == "__main__":
	main()