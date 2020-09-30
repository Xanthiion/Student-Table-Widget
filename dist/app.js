// Table Entry Class
class Student {
  constructor(name, email, level) {
    this.name = name;
    this.email = email;
    this.level = level;
  }
}

// Local Storage Class
class Storage {
  static getStudents() {
    let students;
    if (localStorage.getItem('students') === null) {
      students = [];
    } else {
      students = JSON.parse(localStorage.getItem('students'));
    }
    return students;
  }
  static displayStudents() {
    const students = Storage.getStudents();

    students.forEach(function (student) {
      addStudent(student);
    });
  }
  static pushStudent(student) {
    const students = Storage.getStudents();

    students.push(student);

    localStorage.setItem('students', JSON.stringify(students));
  }
  static removeStudent(email) {
    const students = Storage.getStudents();

    students.forEach(function (student, index) {
      console.log('x');
      console.log(email);
      console.log(student.email);
      if (student.email === email) {
        students.splice(index, 1);
      }
    });

    localStorage.setItem('students', JSON.stringify(students));
  }
}

// DOM Load Event
document.addEventListener('DOMContentLoaded', Storage.displayStudents);

// Student Submit Listener
document.getElementById('student-form').addEventListener('submit', function (e) {
  // Pull values from input streams
  const name = document.getElementById('name').value,
    email = document.getElementById('email').value,
    level = document.getElementById('levels').value;

  // Validate input
  if (name === '' || email === '' || level === 'default') {
    // Invalid Reuslts
    // Ping user to fix problems
    pingAlert('Please fill in all fields', 'error')
  } else {
    // Valid Results
    // Add student to table, clear text fields, ping user: entry was successful
    const student = new Student(name, email, level)
    addStudent(student);
    Storage.pushStudent(student);
    clearInputFields();
    pingAlert('Student Added', 'success');
  }
  // Stop page refresh
  e.preventDefault();
});

function addStudent(student) {
  // Grab table element
  const table = document.getElementById('student-table');

  // Fill table entry with student information
  const entry = document.createElement('tr');
  entry.innerHTML = `
    <td>${student.name}</td>
    <td>${student.email}</td>
    <td>${student.level}</td>
    <td><a href="#" class="edit">Edit </a><a href="#" class="delete">X</a></td>
  `;

  // Print entry to table
  table.appendChild(entry);
}

function pingAlert(alert, alertType) {
  const card = document.querySelector('.card');
  const form = document.querySelector('#student-form');

  // Create new alert div with given parameters
  const div = document.createElement('div');
  div.className = `alert ${alertType}`;
  div.appendChild(document.createTextNode(alert));

  // Push alert div to top of form
  card.insertBefore(div, form);

  // Remove Alert after 5 seconds
  setTimeout(function () {
    document.querySelector('.alert').remove();
  }, 5000);
}

function clearInputFields() {
  // Set all input fields back to default
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('levels').value = 'default';
}

// Delete Entry Listener
document.getElementById('student-table').addEventListener('click', function (e) {
  if (e.target.className === 'delete') {
    e.target.parentElement.parentElement.remove();
    Storage.removeStudent(e.target.parentElement.previousElementSibling.previousElementSibling.textContent);
    pingAlert('Student Removed', 'success');
  }
  e.preventDefault();
});

// Edit Entry Listener
document.getElementById('student-table').addEventListener('click', function (e) {
  if (e.target.className === 'edit') {
    console.log(e.target.parentElement.parentElement)
  }
  e.preventDefault();
});

