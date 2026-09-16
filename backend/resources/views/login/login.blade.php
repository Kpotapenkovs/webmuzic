<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

<h1>login</h1>

    <form method="POST" action="/">

    @csrf 

    @if ($errors->any())
    <ul>
      @foreach ($errors->all() as $error)
          <li>{{ $error }}</li>
      @endforeach
    </ul>
  @endif

    lietotājvārds:<input type="text" name="username" required>
    parole:<input type="password" name="password" required>
    <button>pieslēgties</button>
    </form>
</body>
</html>