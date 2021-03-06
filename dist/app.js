// Table Entry Class
class Student {
  constructor(name, email, level) {
    this.name = name;
    this.email = email;
    this.level = level;
    this.editting = false; // signifies if entry is being editted
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
  static printStudents() {
    const widget = new WidgetUI();
    // retrieve students in local Storage
    const students = Storage.getStudents();

    // print each student to table 
    students.forEach(function (student) {
      student.editting = false;
      widget.addStudent(student);
    });
    localStorage.setItem('students', JSON.stringify(students));
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
    // remove student in array with given email
    const students = Storage.getStudents();
    students.forEach(function (student, index) {
      if (student.email === email) {
        students.splice(index, 1);
      }
    });
    // restore students in local storage
    localStorage.setItem('students', JSON.stringify(students));
  }

  static checkDuplicate(email) {
    // scan students - check if there are any emails matching entry
    const students = Storage.getStudents();
    let duplicate = false;
    students.forEach(function (student) {
      if (student.email === email && student.editting === false) {
        // Duplicate found
        duplicate = true;
        return;
      }
    });
    return duplicate;
  }
  static checkEditting() {
    // scan students - check if there are any emails matching entry
    const students = Storage.getStudents();
    let editting = false;
    students.forEach(function (student) {
      if (student.editting === true) {
        // A student is being editted
        editting = true;
        return;
      }
    });
    return editting;
  }

  static startEdittingStudent(email) {
    // set editting to true for student in storage with given email
    const students = Storage.getStudents();
    students.forEach(function (student) {
      if (student.email === email) {
        student.editting = true;
        return;
      }
    });
    localStorage.setItem('students', JSON.stringify(students));
  }

  static saveEdittingStudent(newStudent) {
    // replace student thats being editted with given newStudent
    const students = Storage.getStudents();
    students.forEach(function (student, index) {
      if (student.editting === true) {
        // Copy whats in newStudent to student
        Object.assign(student, newStudent);
        return;
      }
    });
    localStorage.setItem('students', JSON.stringify(students));
  }
}

// Widget Interface -- instantiate when modifying UI
class WidgetUI {
  addStudent(student) {
    // Grab table element
    const table = document.getElementById('student-table');

    // Fill table entry with student information
    const entry = document.createElement('tr');
    entry.innerHTML = `
      <td class="student-name">${student.name}</td>
      <td>${student.email}</td>
      <td>${student.level}</td>
      <td><a href="#" class="edit">Edit</a><a href="#" class="save">Save</a><a href="#" class="delete">X</a></td>
    `;

    // Check if a student is being editted, if so remove entries edit+del btns
    if (Storage.checkEditting()) {
      entry.querySelector('.edit').style.display = 'none';
      entry.querySelector('.delete').style.display = 'none';
    }

    // Print entry to table
    table.appendChild(entry);
  }

  pingAlert(alert, alertType) {
    // Clear all existing timeouts - Code sourced from:
    // https://stackoverflow.com/questions/8860188/javascript-clear-all-timeouts
    let timeoutID = window.setTimeout(function () { }, 0);
    while (timeoutID--) {
      window.clearTimeout(timeoutID);
    }

    // Remove existing alert if present
    if (document.querySelector('.alert') !== null) {
      document.querySelector('.alert').remove()
    }
    // Grab end of widget
    const end = document.querySelector('#end');

    // Create new alert div with given parameters
    const div = document.createElement('div');
    div.className = `alert ${alertType}`;
    div.appendChild(document.createTextNode(alert));

    // Push alert div to bottom of widget
    end.parentNode.insertBefore(div, end.nextSibling);

    // Remove Alert after 5 seconds
    setTimeout(function () {
      document.querySelector('.alert').remove()
    }, 5000);
  }

  clearInputFields() {
    // Set all input fields back to default
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('levels').value = 'default';
  }

  editStudent(student) {
    // grab all elements within the entry
    const name = student.querySelector('td:nth-child(1)'),
      email = student.querySelector('td:nth-child(2)'),
      level = student.querySelector('td:nth-child(3)'),
      save = student.querySelector('td:nth-child(4) a:nth-child(2)');

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

    // Make all edit+delete buttons invisible, make save button visible
    document.querySelectorAll('.edit').forEach(function (edit) {
      edit.style.display = 'none';
    });
    document.querySelectorAll('.delete').forEach(function (del) {
      del.style.display = 'none';
    });
    save.style.display = 'inline';

    // Disable search during edit
    document.getElementById('search-input').disabled = true;

    // tell storage current student is being editted
    Storage.startEdittingStudent(emailVal);
  }

  saveStudent(student) {
    const widget = new WidgetUI();

    // grab all elements within the entry
    const name = student.querySelector('td:nth-child(1)'),
      email = student.querySelector('td:nth-child(2)'),
      level = document.getElementById('newLevels'),
      save = student.querySelector('td:nth-child(4) a:nth-child(2)');

    // Create student with input vals
    const newStudent = new Student(name.firstChild.value, email.firstChild.value, level.value);

    // Check if new entry is valid
    if (Form.validateInput(newStudent, email.firstChild)) {
      // Valid Entry
      widget.pingAlert('New Student saved', 'success');
      // Replace elements with text nodes of their content
      name.innerHTML = newStudent.name;
      email.innerHTML = newStudent.email;
      level.parentElement.innerHTML = newStudent.level;

      // Make all edit+delete buttons visible, make save button invisible
      document.querySelectorAll('.edit').forEach(function (edit) {
        edit.style.display = 'inline';
      });
      document.querySelectorAll('.delete').forEach(function (del) {
        del.style.display = 'inline';
      });
      save.style.display = 'none';

      // Re-Enable Search Feature
      document.getElementById('search-input').disabled = false;

      // Push new entry to local Storage
      Storage.saveEdittingStudent(newStudent);
    }
  }
}

// Form Class
class Form {
  static validateInput(student, email) {
    const widget = new WidgetUI();

    // Ensure names are filled, email is valid, and entry is not a duplicate
    if (student.name === '' || student.email === '' || student.level === 'default') {
      // Invalid Reuslts - empty field
      widget.pingAlert('Please fill in all fields', 'error');
      return false;
    } else if (!email.checkValidity()) {
      // Invalid Results - invalid email
      widget.pingAlert('Please enter a valid email', 'error');
      return false;
    } else if (Storage.checkDuplicate(student.email)) {
      // Invalid Results - duplicate entry
      widget.pingAlert('Student with this email already exists', 'error');
      return false;
    }

    return true;
  }
}

// DOM Load Event - Fill table with students from Local Storage
document.addEventListener('DOMContentLoaded', Storage.printStudents);

// Student Submit Listener
document.getElementById('student-form').addEventListener('submit', function (e) {
  const widget = new WidgetUI();
  // Pull values from input streams
  const name = document.getElementById('name'),
    email = document.getElementById('email'),
    level = document.getElementById('levels');

  const student = new Student(name.value, email.value, level.value);
  // Validate input
  if (Form.validateInput(student, email)) {
    // Valid Input - Add Entry
    widget.addStudent(student);
    widget.clearInputFields();
    widget.pingAlert('Student added', 'success');

    // Push student info to local storage
    Storage.pushStudent(student);
  }

  // Stop page refresh
  e.preventDefault();
});

document.getElementById('search-input').addEventListener('keyup', function (e) {
  // grab input from search field
  const input = e.target.value.toLowerCase();

  document.querySelectorAll('.student-name').forEach(function (studentName) {
    const name = studentName.textContent;

    // check if input matches any student names
    if (name.toLowerCase().indexOf(input) == 0) {
      // get rid of "display: none" if present; show entry
      studentName.parentNode.style = '';
    } else {
      // name filtered out
      studentName.parentNode.style.display = 'none';
    }
  });
});

// Delete Entry Listener
document.getElementById('student-table').addEventListener('click', function (e) {
  const widget = new WidgetUI();
  // Check if click occured on Delete button
  if (e.target.className === 'delete') {
    // Remove tr element containing student
    e.target.parentElement.parentElement.remove();
    // Remove student from Local Storage
    Storage.removeStudent(e.target.parentElement.previousElementSibling.previousElementSibling.textContent);
    // Ping user that student was removed
    widget.pingAlert('Student Removed', 'success');
  }
  e.preventDefault();
});

// Edit Entry Listener
document.getElementById('student-table').addEventListener('click', function (e) {
  const widget = new WidgetUI();
  // Check if click was on edit button
  if (e.target.className === 'edit') {
    // change text nodes to text fields
    widget.editStudent(e.target.parentElement.parentElement);
  }
  e.preventDefault();
});

// Save Entry Listener
document.getElementById('student-table').addEventListener('click', function (e) {
  const widget = new WidgetUI();
  // Check if click was on save button
  if (e.target.className === 'save') {
    // Set input streams back to text Nodes
    widget.saveStudent(e.target.parentElement.parentElement);
  }
  e.preventDefault();
});

