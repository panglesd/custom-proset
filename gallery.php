<?php
echo "test";
$servername = "localhost";
$username = "customproset";
$password = "yourpasshere";
$dbname = "custom_proset";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
if(isset($_POST["new_entry"])) {
    $sql = "INSERT INTO gallery(author, name, comment) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $author=htmlspecialchars($_POST["author"]);
    $name=htmlspecialchars($_POST["name"]);
    $comment=htmlspecialchars($_POST["comment"]);
    $stmt->bind_param("sss", $author, $name, $comment);
    $stmt->execute();
    printf("%d ligne insérée.\n", $stmt->affected_rows);
    $last_id = $conn->insert_id;


    // print_r ($_POST);

    // Todo: Write file "$last_id.json"
    file_put_contents("$last_id.json", $_POST["source"]);

    // Todo: compile "$last_id.json" to "$last_id.pdf"
    shell_exec("node compile.js $last_id.json $last_id.pdf");


    echo "last id inserted";
    echo $last_id;
    /* Fermeture du traitement */
    $stmt->close();
}

// if ($stmt.execute() === TRUE) {
//     $last_id = $conn->insert_id;
//     echo "New record created successfully. Last inserted ID is: " . $last_id;
// } else {
//     echo "Error: " . $sql . "<br>" . $conn->error;
// }
$sql = "SELECT * FROM gallery";

$result = $conn->query($sql);
    

?>


<!doctype html>
<html>
    <head>
	<title></title>
	<meta charset="utf-8" />
    </head>
    <body>
	<?php
	if($result) {
	    while ($row = $result->fetch_assoc()) {
		echo '<div class="proset-game">';
		echo "Set named $row[name] from $row[author]. Download <a href=$row[id].pdf>here</a> ";
		/* printf ("%s (%s)\n", $row['author'], $row['name']);*/
		echo '</div>';
	     }
	    $result->close();
	}
	$conn->close();
	?>
    </body>
</html>
