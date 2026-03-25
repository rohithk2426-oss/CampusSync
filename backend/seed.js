const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
const Assignment = require('./models/Assignment');
const Feedback = require('./models/Feedback');
const Notification = require('./models/Notification');

const connectDB = require('./config/db');

const subjectData = [
    // Class CSE-A (Year 1, Sem 1)
    { name: 'Engineering Mathematics I', code: 'MA101', category: 'theory', semester: 1, hours: 1 },
    { name: 'Programming in C', code: 'CS101', category: 'lab_integrated', semester: 1, hours: 2 },
    { name: 'Digital Logic Design', code: 'CS102', category: 'theory', semester: 1, hours: 1 },
    { name: 'Physics for Engineers', code: 'PH101', category: 'theory', semester: 1, hours: 1 },
    { name: 'C Programming Lab', code: 'CS103', category: 'lab', semester: 1, hours: 2 },
    { name: 'Communication Skills', code: 'EN101', category: 'theory', semester: 1, hours: 1 },

    // Class CSE-B (Year 2, Sem 3)
    { name: 'Data Structures', code: 'CS201', category: 'lab_integrated', semester: 3, hours: 2 },
    { name: 'Computer Organization', code: 'CS202', category: 'theory', semester: 3, hours: 1 },
    { name: 'Discrete Mathematics', code: 'MA201', category: 'theory', semester: 3, hours: 1 },
    { name: 'Object Oriented Programming', code: 'CS203', category: 'lab_integrated', semester: 3, hours: 2 },
    { name: 'Data Structures Lab', code: 'CS204', category: 'lab', semester: 3, hours: 4 },
    { name: 'Environmental Science', code: 'GE201', category: 'theory', semester: 3, hours: 1 },

    // Class CSE-C (Year 3, Sem 5)
    { name: 'Database Management Systems', code: 'CS301', category: 'lab_integrated', semester: 5, hours: 2 },
    { name: 'Operating Systems', code: 'CS302', category: 'lab_integrated', semester: 5, hours: 2 },
    { name: 'Computer Networks', code: 'CS303', category: 'theory', semester: 5, hours: 1 },
    { name: 'Software Engineering', code: 'CS304', category: 'theory', semester: 5, hours: 1 },
    { name: 'DBMS Lab', code: 'CS305', category: 'lab', semester: 5, hours: 4 },
    { name: 'Web Technologies', code: 'CS306', category: 'lab_integrated', semester: 5, hours: 2 },

    // Class CSE-D (Year 4, Sem 7)
    { name: 'Machine Learning', code: 'CS401', category: 'lab_integrated', semester: 7, hours: 2 },
    { name: 'Cloud Computing', code: 'CS402', category: 'theory', semester: 7, hours: 1 },
    { name: 'Information Security', code: 'CS403', category: 'theory', semester: 7, hours: 1 },
    { name: 'Big Data Analytics', code: 'CS404', category: 'lab_integrated', semester: 7, hours: 2 },
    { name: 'ML Lab', code: 'CS405', category: 'lab', semester: 7, hours: 4 },
    { name: 'Project Work', code: 'CS406', category: 'lab', semester: 7, hours: 4 }
];

const facultyNames = [
    'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Suresh Babu',
    'Dr. Anita Verma', 'Dr. Karthik Rajan', 'Dr. Meena Sundari',
    'Dr. Vikram Singh', 'Dr. Lakshmi Narayanan', 'Dr. Arun Prakash',
    'Dr. Deepa Krishnan', 'Dr. Mohan Das', 'Dr. Kavitha Ramesh',
    'Dr. Sanjay Gupta', 'Dr. Revathi Palani', 'Dr. Balaji Subramanian'
];

const studentNames = [
    // Class A
    'Arun Kumar', 'Bharathi Devi', 'Chandru Mohan', 'Divya Lakshmi', 'Ezhilan Raja',
    'Fathima Begum', 'Gokul Krishnan', 'Harini Priya', 'Ishaan Reddy', 'Janani Sundari',
    // Class B
    'Karthik Selvam', 'Lavanya Murali', 'Manoj Kumar', 'Nithya Shree', 'Om Prakash',
    'Preethi Rajan', 'Rahul Venkat', 'Sathya Priya', 'Tamil Selvan', 'Uma Maheshwari',
    // Class C
    'Vignesh Raman', 'Yamuna Devi', 'Aakash Pandian', 'Bhuvaneshwari K', 'Deepak Raj',
    'Gayathri Sundaram', 'Hari Krishnan', 'Indira Ganesan', 'Jayakumar Pillai', 'Keerthana Bala',
    // Class D
    'Logesh Murugan', 'Meenakshi Rani', 'Naveen Babu', 'Oviya Sundari', 'Prem Anand',
    'Ramya Krishnan', 'Surya Prakash', 'Tamilarasi Devi', 'Udhaya Kumar', 'Vijay Shankar'
];

async function seed() {
    try {
        await connectDB();
        console.log('🗑️  Clearing existing data...');

        await User.deleteMany({});
        await Student.deleteMany({});
        await Faculty.deleteMany({});
        await Subject.deleteMany({});
        await Class.deleteMany({});
        await Assignment.deleteMany({});
        await Feedback.deleteMany({});
        await Notification.deleteMany({});

        // ============ Create HOD ============
        console.log('👨‍💼 Creating HOD...');
        const hodUser = await User.create({
            name: 'Dr. Venkatesh Raman',
            email: 'hod@campussync.com',
            password: 'password123',
            role: 'hod'
        });

        // ============ Create Lab Incharge ============
        console.log('🧪 Creating Lab Incharge...');
        const labUser = await User.create({
            name: 'Mr. Senthil Kumar',
            email: 'labincharge@campussync.com',
            password: 'password123',
            role: 'labincharge'
        });

        // ============ Create Classes ============
        console.log('🏫 Creating 4 classes...');
        const classes = [];
        const classInfos = [
            { name: 'CSE-A', year: 1, semester: 1 },
            { name: 'CSE-B', year: 2, semester: 3 },
            { name: 'CSE-C', year: 3, semester: 5 },
            { name: 'CSE-D', year: 4, semester: 7 }
        ];

        for (const ci of classInfos) {
            const cls = await Class.create(ci);
            classes.push(cls);
        }

        // ============ Create Faculty ============
        console.log('👨‍🏫 Creating 15 faculty members...');
        const facultyList = [];
        for (let i = 0; i < 15; i++) {
            const user = await User.create({
                name: facultyNames[i],
                email: `faculty${i + 1}@campussync.com`,
                password: 'password123',
                role: 'faculty'
            });

            const fac = await Faculty.create({
                user: user._id,
                employeeId: `FAC${String(i + 1).padStart(3, '0')}`,
                designation: i < 5 ? 'Professor' : i < 10 ? 'Associate Professor' : 'Assistant Professor'
            });

            facultyList.push(fac);
        }

        // ============ Create Subjects & Assign Faculty ============
        console.log('📚 Creating 24 subjects...');
        const subjectList = [];
        for (let i = 0; i < subjectData.length; i++) {
            const sd = subjectData[i];
            const classIndex = Math.floor(i / 6);
            const facultyIndex = i % 15;

            const subject = await Subject.create({
                name: sd.name,
                code: sd.code,
                category: sd.category,
                semester: sd.semester,
                classId: classes[classIndex]._id,
                faculty: facultyList[facultyIndex]._id,
                hoursPerSession: sd.hours
            });

            // Add subject to faculty
            await Faculty.findByIdAndUpdate(facultyList[facultyIndex]._id, {
                $addToSet: { subjects: subject._id }
            });

            subjectList.push(subject);
        }

        // ============ Create Students ============
        console.log('👨‍🎓 Creating 40 students (10 per class)...');
        for (let c = 0; c < 4; c++) {
            const classSubjects = subjectList.filter(s =>
                s.classId.toString() === classes[c]._id.toString()
            );

            for (let s = 0; s < 10; s++) {
                const idx = c * 10 + s;
                const user = await User.create({
                    name: studentNames[idx],
                    email: `student${idx + 1}@campussync.com`,
                    password: 'password123',
                    role: 'student'
                });

                const student = await Student.create({
                    user: user._id,
                    rollNumber: `${classes[c].name.replace('-', '')}${String(s + 1).padStart(3, '0')}`,
                    classId: classes[c]._id,
                    semester: classes[c].semester,
                    isCR: s === 0, // First student in each class is CR
                    subjects: classSubjects.map(sub => sub._id)
                });

                await Class.findByIdAndUpdate(classes[c]._id, {
                    $push: { students: student._id }
                });
            }
        }

        // ============ Print Login Credentials ============
        console.log('\n✅ Seed completed successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('           LOGIN CREDENTIALS           ');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('🔑 HOD:');
        console.log('   Email: hod@campussync.com');
        console.log('   Password: password123');
        console.log('');
        console.log('🔑 Lab Incharge:');
        console.log('   Email: labincharge@campussync.com');
        console.log('   Password: password123');
        console.log('');
        console.log('🔑 Faculty (15 accounts):');
        console.log('   Email: faculty1@campussync.com to faculty15@campussync.com');
        console.log('   Password: password123');
        console.log('');
        console.log('🔑 Students (40 accounts):');
        console.log('   Email: student1@campussync.com to student40@campussync.com');
        console.log('   Password: password123');
        console.log('   CRs: student1 (CSE-A), student11 (CSE-B), student21 (CSE-C), student31 (CSE-D)');
        console.log('');
        console.log('═══════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
