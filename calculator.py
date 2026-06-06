from flask import Flask, request, render_template_string

app = Flask(__name__)

HTML = '''
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Simple Calculator</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; background: #f4f7fb; color: #20232a; }
    .calculator { max-width: 420px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
    input, select, button { width: 100%; padding: 0.9rem; margin: 0.5rem 0; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
    button { background: #2563eb; color: white; border: none; cursor: pointer; }
    button:hover { background: #1d4ed8; }
    .result { background: #eef2ff; border: 1px solid #c7d2fe; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="calculator">
    <h1>Simple Calculator</h1>
    <form method="post">
      <label for="a">First number</label>
      <input type="number" step="any" id="a" name="a" value="{{ a }}" required>

      <label for="b">Second number</label>
      <input type="number" step="any" id="b" name="b" value="{{ b }}" required>

      <label for="operation">Operation</label>
      <select id="operation" name="operation">
        <option value="add" {% if operation == 'add' %}selected{% endif %}>Add (+)</option>
        <option value="subtract" {% if operation == 'subtract' %}selected{% endif %}>Subtract (-)</option>
        <option value="multiply" {% if operation == 'multiply' %}selected{% endif %}>Multiply (×)</option>
        <option value="divide" {% if operation == 'divide' %}selected{% endif %}>Divide (÷)</option>
      </select>

      <button type="submit">Calculate</button>
    </form>

    {% if result is not none %}
      <div class="result">
        <strong>Result:</strong> {{ result }}
      </div>
    {% endif %}

    {% if error %}
      <div class="result" style="background:#fee2e2; border-color:#fecaca;">
        <strong>Error:</strong> {{ error }}
      </div>
    {% endif %}
  </div>
</body>
</html>
'''

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    error = ''
    a = request.form.get('a', '0')
    b = request.form.get('b', '0')
    operation = request.form.get('operation', 'add')

    if request.method == 'POST':
        try:
            num_a = float(a)
            num_b = float(b)

            if operation == 'add':
                result = num_a + num_b
            elif operation == 'subtract':
                result = num_a - num_b
            elif operation == 'multiply':
                result = num_a * num_b
            elif operation == 'divide':
                if num_b == 0:
                    error = 'Cannot divide by zero.'
                else:
                    result = num_a / num_b
            else:
                error = 'Unknown operation.'
        except ValueError:
            error = 'Please enter valid numbers.'

    return render_template_string(
        HTML,
        result=result,
        error=error,
        a=a,
        b=b,
        operation=operation,
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
