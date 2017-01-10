<!DOCTYPE html>
<html>
	<head>
		<title>xoly testor</title>
	</head>

	<body>
		<cfset a = 123>

		<cfoutput>
			<cfloop list="a,b,c,d" index="a">
			#a#
			</cfloop>
		</cfoutput>
	</body>
</html>