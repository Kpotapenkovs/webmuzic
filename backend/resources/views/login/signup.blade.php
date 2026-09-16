
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<h1>Reģistrēties</h1>

<form method="POST">

  <label>

  @csrf

  @if ($errors->any())
    <ul>
      @foreach ($errors->all() as $error)
          <li>{{ $error }}</li>
      @endforeach
    </ul>
  @endif

  <p>lietotājvārds: </p><input type="text" name="username" required>

  <br>
  <br>

  <p>parole: </p><input type="password" name="password" required>

  <br>

  <br>
  <p>paroles pastiprināšana: </p><input type="password" name="password_confirmation" required>

  <br>
  <br>

  <button type="submit">reģistrēties</button>

  </label>

</form>


</body>
</html>