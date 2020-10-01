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
  // return array of existing students
  static getStudents() {
    let students;
    if (localStorage.getItem('students') === null) {
      // Students not initialized in local Storage
      students = [];
    } else {
      // Students found in local Storage
      students = JSON.parse(localStorage.getItem('students'));
    }
    // Return array of students
    return students;
  }

  // fill table with students in local storage
  static displayStudents() {
    // retrieve students in local Storage
    const students = Storage.getStudents();

    // print each student to table 
    students.forEach(function (student) {
      addStudent(student);
    });
  }

  // add student to students array in local storage
  static pushStudent(student) {
    // retrieve existing students
    const students = Storage.getStudents();
    // push student to existing array
    students.push(student);
    // restore students in local storage
    localStorage.setItem('students', JSON.stringify(students));
  }
  // remove student from list (emails are unique identifiers)
  static removeStudent(email) {
    // retrieve existing students
    const students = Storage.getStudents();
    // scan through students array and remove duplicate
    students.forEach(function (student, index) {
      if (student.email === email) {
        students.splice(index, 1);
      }
    });
    // restore students in local storage
    localStorage.setItem('students', JSON.stringify(students));
  }

  static checkDuplicate(email) {
    // retrieve existing students
    const students = Storage.getStudents();
    // Check if there are any emails matching entry
    let duplicate = false;
    students.forEach(function (student) {
      if (student.email === email) {
        // Duplicate found
        duplicate = true;
        return;
      }
    });
    return duplicate;
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
  console.log(Storage.checkDuplicate(email));
  // Validate input
  if (name === '' || email === '' || level === 'default') {
    // Invalid Reuslts - empty field
    pingAlert('Please fill in all fields', 'error');

  } else if (Storage.checkDuplicate(email)) {
    // Invalid Results - duplicate entry
    pingAlert('Student with this email already exists', 'error');
  } else {
    // Valid Results
    // Add student to table, clear text fields, ping user: entry was successful
    const student = new Student(name, email, level);
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
    <td><a href="#" class="edit">Edit </a><a href="#" class="save">Save </a><a href="#" class="delete">X</a></td>
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
  // Check if click occured on Delete button
  if (e.target.className === 'delete') {
    // Remove tr element containing student
    e.target.parentElement.parentElement.remove();
    // Remove student from Local Storage
    Storage.removeStudent(e.target.parentElement.previousElementSibling.previousElementSibling.textContent);
    // Ping user that student was removed
    pingAlert('Student Removed', 'success');
  }
  e.preventDefault();
});

// Edit Entry Listener
document.getElementById('student-table').addEventListener('click', function (e) {
  // Check if click was on edit button
  if (e.target.className === 'edit') {
    // change text nodes to text fields
    makeModifiable(e.target.parentElement.parentElement);
  }
  e.preventDefault();
});

function makeModifiable(element) {
  // grab all elements within the entry
  const name = element.querySelector('td:nth-child(1)'),
    email = element.querySelector('td:nth-child(2)'),
    level = element.querySelector('td:nth-child(3)'),
    edit = element.querySelector('td:nth-child(4)');

  // Copy values from elements
  const nameVal = name.textContent,
    emailVal = email.textContent,
    levelVal = level.textContent;

  // Change elements into input streams, set initial values to original content
  name.innerHTML = `<input type="text" value="${nameVal}">`;
  email.innerHTML = `<input type="email" value="${emailVal}">`;
  level.innerHTML = `
    <select name="levels" id="newLevels">
      <option hidden disabled selected value='${levelVal}'>${levelVal}</option>
      <option value="Freshman"> Freshman</option>
      <option value="Sophomore">Sophomore</option>
      <option value="Junior">Junior</option>
      <option value="Senior">Senior</option>
    </select>`;

  // Make Edit button invisible and Save button visible
  edit.firstChild.style.display = 'none';
  edit.querySelector('a:nth-child(2)').style.display = 'inline';

  // Remove previous entry from local Storage
  Storage.removeStudent(emailVal);
}

// Save Entry Listener
document.getElementById('student-table').addEventListener('click', function (e) {
  // Check if click was on save button
  if (e.target.className === 'save') {
    // Set input streams back to text Nodes
    makeConcrete(e.target.parentElement.parentElement);
  }
  e.preventDefault();
});

function makeConcrete(element) {
  // grab all elements within the entry
  const name = element.querySelector('td:nth-child(1)'),
    email = element.querySelector('td:nth-child(2)'),
    level = document.getElementById('newLevels'),
    save = element.querySelector('td:nth-child(4)');

  // Copy values from elements
  const nameVal = name.firstChild.value,
    emailVal = email.firstChild.value,
    levelVal = level.value;

  // Replace elements with text nodes of their content
  name.innerHTML = nameVal;
  email.innerHTML = emailVal;
  level.parentElement.innerHTML = levelVal;

  // Make edit button visible and save invisible
  save.firstChild.style.display = 'inline';
  save.querySelector('a:nth-child(2)').style.display = 'none';

  // Push new entry to local Storage
  Storage.pushStudent(new Student(nameVal, emailVal, levelVal));
}