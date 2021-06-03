<?php

include "credentials.php";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
if(isset($_POST["new_entry"])) {
    $sql = "INSERT INTO gallery(author, name, comment, password) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $author=htmlspecialchars($_POST["author"]);
    $name=htmlspecialchars($_POST["name"]);
    $comment=htmlspecialchars($_POST["comment"]);
    $passwd=password_hash($_POST["passwd"], PASSWORD_DEFAULT);
    $stmt->bind_param("ssss", $author, $name, $comment, $passwd);
    $stmt->execute();
    /* printf("%d ligne insérée.\n", $stmt->affected_rows); */
    $last_id = $conn->insert_id;


    // print_r ($_POST);

    // Todo: Write file "$last_id.json"
    file_put_contents("db_file/$last_id.json", $_POST["source"]);

    // Todo: compile "$last_id.json" to "$last_id.pdf"
    shell_exec("node compile.js db_file/$last_id.json $last_id.pdf");
    shell_exec("mv $last_id.pdf db_file/$last_id.pdf");
    shell_exec("mv thumbnail_$last_id.pdf db_file/thumbnail_$last_id.pdf");

    shell_exec("convert db_file/thumbnail_$last_id.pdf db_file/$last_id.png");

    /* echo "last id inserted"; */
    /* echo $last_id; */
    /* Fermeture du traitement */
    $stmt->close();
}
if(isset($_POST["idtodelete"])) {
    $sqlSelect = "SELECT password FROM gallery WHERE id = ?";
    $stmtSelect = $conn->prepare($sqlSelect);
    $stmtSelect->bind_param("i", $_POST["idtodelete"]);
    $resultSelect = $stmtSelect->execute();
    if($resultSelect) {
        $stmtSelect->bind_result($pass_in_db);
        $stmtSelect->fetch();
        $stmtSelect->close();
        // $rowSelect = $resultSelect->fetch_assoc();
        if(password_verify($_POST["passwordtodelete"], $pass_in_db)) {
            $sql = "DELETE FROM gallery WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $_POST["idtodelete"]);
            $result = $stmt->execute();
            $stmt->close();
        }
    }
    /* printf("%d ligne insérée.\n", $stmt->affected_rows); */
    /* Fermeture du traitement */
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
	<link href="gallery.css" rel="stylesheet"/>
    </head>
    <body>
	<h1>Gallery of user created proset games</h1>
	<!-- <div>To submit your own proset, click <a href="index.html">here</a>.</div> -->
	<div class="proset-list">
	    <?php
	    if($result) {
		while ($row = $result->fetch_assoc()) {
		    echo '<div class="proset-game">';
		    echo "<a href=\"db_file/$row[id].pdf\">";
		    echo "<img src=\"db_file/$row[id].png\"/></a>";
		    echo "</a>";
		    echo "<div class=\"set-name\">$row[name]</div>";
		    echo "<div class=\"set-author\">By: $row[author]</div>";
		    echo "<div class=\"set-date\">$row[date]</div>";
		    if ((strcmp($row["comment"], "") !== 0))
			echo "<div class=\"set-comment\">Comment: $row[comment]</div>";
		    echo "<div class=\"open-editor\"><a href=\"index.html?id=$row[id]\">Open in editor</div></a>";
            echo '<form method="post"><input type="hidden" name="idtodelete" value="'."$row[id]".'"/><input size="6" placeholder="Password" type="password" name="passwordtodelete"><input type="submit" value="Delete"/></form>';
		    /* printf ("%s (%s)\n", $row['author'], $row['name']);*/
		    echo '</div>';
		}
		$result->close();
	    }
	    $conn->close();
	    ?>
	</div>
	<p>Return to <a href="index.html">the editor</a></p>
    </body>
</html>
