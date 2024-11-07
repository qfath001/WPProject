import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Button, Container, Grid, Typography, TextField, Select, MenuItem, IconButton, Box, Checkbox, Alert
} from '@mui/material';
import { AddCircle as AddCircleIcon, Delete as DeleteIcon, Home as HomeIcon } from '@mui/icons-material';

const CourseAdvisingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const advisingTerm = queryParams.get('advisingTerm');
  const statusFromParams = queryParams.get('status');
  
  const [lastTerm, setLastTerm] = useState('');
  const [lastGPA, setLastGPA] = useState('');
  const [status, setStatus] = useState(statusFromParams || '');
  const [advisingTermField, setAdvisingTerm] = useState(advisingTerm || '');
  const [originalLastTerm, setOriginalLastTerm] = useState(''); // Track original last term
  const [originalAdvisingTerm, setOriginalAdvisingTerm] = useState(''); // Track original advising term
  const [enablePrerequisites, setEnablePrerequisites] = useState(true);
  const [prerequisites, setPrerequisites] = useState([]);
  const [coursePlan, setCoursePlan] = useState([]);
  const [error, setError] = useState('');
  const [enabledCourses, setEnabledCourses] = useState([]);
  const [coursePlanCatalog, setCoursePlanCatalog] = useState([]);
  const [takenCourses, setTakenCourses] = useState([]);
  const isEditable = status === 'Pending';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enabledCoursesResponse, courseCatalogResponse, takenCoursesResponse] = await Promise.all([
          axios.get('http://localhost:4000/advising/enabled-courses', { withCredentials: true }),
          axios.get('http://localhost:4000/advising/course-catalog', { withCredentials: true }),
          axios.get(`http://localhost:4000/advising/taken-courses?currentTerm=${encodeURIComponent(advisingTermField)}`, { withCredentials: true }),
        ]);

        setEnabledCourses(enabledCoursesResponse.data);
        setCoursePlanCatalog(courseCatalogResponse.data);
        setTakenCourses(takenCoursesResponse.data);

        console.log('Fetched taken courses:', takenCoursesResponse.data); // Add this log to verify

        if (advisingTerm && isEditable) {
          const advisingDataResponse = await axios.get(`http://localhost:4000/advising/advising-history/${encodeURIComponent(advisingTerm)}`, { withCredentials: true });
          const { last_term, last_gpa, prerequisites, course_plan, status } = advisingDataResponse.data;

          setLastTerm(last_term);
          setLastGPA(last_gpa);
          setPrerequisites(prerequisites || []);
          setCoursePlan(course_plan || []);
          setStatus(status);

          // Set original values
          setOriginalLastTerm(last_term);
          setOriginalAdvisingTerm(advisingTerm);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      }
    };
    fetchData();
  }, [advisingTerm, advisingTermField, isEditable]);

  const handleAddPrerequisite = () => {
    if (enablePrerequisites) {
      setPrerequisites([...prerequisites, { level: '', courseName: '' }]);
    }
  };

  const handleDeletePrerequisite = (index) => {
    const updatedPrerequisites = prerequisites.filter((_, i) => i !== index);
    setPrerequisites(updatedPrerequisites);
  };

  const handleChangePrerequisiteLevel = (index, value) => {
    const updatedPrerequisites = prerequisites.map((prerequisite, i) => {
      if (i === index) {
        return { ...prerequisite, level: value, courseName: '' };
      }
      return prerequisite;
    });
    setPrerequisites(updatedPrerequisites);
  };

  const handleChangePrerequisiteCourse = (index, value) => {
    const updatedPrerequisites = prerequisites.map((prerequisite, i) => {
      if (i === index) {
        return { ...prerequisite, courseName: value };
      }
      return prerequisite;
    });
    setPrerequisites(updatedPrerequisites);
  };

  const handlePrerequisiteCheckboxChange = (event) => {
    const checked = event.target.checked;
    setEnablePrerequisites(!checked);
    if (checked) {
      setPrerequisites([]); // Clear prerequisites if checkbox is checked
    }
  };

  const handleAddCoursePlan = () => {
    setCoursePlan([...coursePlan, { level: '', courseName: '' }]);
  };

  const handleDeleteCoursePlan = (index) => {
    const updatedCoursePlan = coursePlan.filter((_, i) => i !== index);
    setCoursePlan(updatedCoursePlan);
  };

  const handleChangeCoursePlanLevel = (index, value) => {
    const updatedCoursePlan = coursePlan.map((course, i) => {
      if (i === index) {
        return { ...course, level: value, courseName: '' };
      }
      return course;
    });
    setCoursePlan(updatedCoursePlan);
  };

  const handleChangeCoursePlanCourse = (index, value) => {
    const updatedCoursePlan = coursePlan.map((course, i) => {
      if (i === index) {
        return { ...course, courseName: value };
      }
      return course;
    });
    setCoursePlan(updatedCoursePlan);
  };

  const getUniqueLevels = (minLevel, maxLevel, courses) => {
    const levels = courses.filter(course => course.level >= minLevel && course.level <= maxLevel).map(course => course.level);
    return [...new Set(levels)];
  };

  const getCoursesByLevel = (level, courses) => {
    return courses.filter(course => course.level === level);
  };

  const validateForm = () => {
    if (!lastTerm || !lastGPA || !advisingTermField) {
      setError('Last Term, Last GPA, and Advising Term are mandatory.');
      return false;
    }
    if (coursePlan.length === 0 || coursePlan.some(plan => !plan.level || !plan.courseName)) {
      setError('Please select at least one course in the Course Plan section.');
      return false;
    }

    const prerequisiteCourses = prerequisites.map(prerequisite => prerequisite.courseName);
    if (new Set(prerequisiteCourses).size !== prerequisiteCourses.length) {
      setError('Duplicate courses are selected in the Prerequisites section.');
      return false;
    }

    const coursePlanCourses = coursePlan.map(course => course.courseName);
    if (new Set(coursePlanCourses).size !== coursePlanCourses.length) {
      setError('Duplicate courses are selected in the Course Plan section.');
      return false;
    }
    // Normalize and compare taken courses
  console.log('Course Plan being validated:', coursePlan); // Debugging log
  console.log('Taken Courses for validation:', takenCourses); // Debugging log
    // Normalize and compare taken courses
    for (let course of coursePlan) {
      const courseNameNormalized = course.courseName.trim().toLowerCase();
      const takenCoursesNormalized = takenCourses.map(c => c.trim().toLowerCase());
      if (takenCoursesNormalized.includes(courseNameNormalized)) {
        setError(`The course \"${course.courseName}\" has already been taken in previous terms.`);
        return false;
      }
    }    
    setError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate fields before proceeding
    if (isEditable && (lastTerm !== originalLastTerm || advisingTermField !== originalAdvisingTerm)) {
      setError('Last term and Advising term cannot be changed while editing.');
      return;
    }

    if (!validateForm()) return;

    try {
      if (isEditable && advisingTerm) {
        await axios.put(`http://localhost:4000/advising/advising-history/${encodeURIComponent(advisingTerm)}`, {
          lastTerm,
          lastGPA,
          advisingTerm: advisingTermField,
          prerequisites: enablePrerequisites ? prerequisites : [], // Ensure empty array if no prerequisites
          coursePlan,
        }, { withCredentials: true });
        alert('Advising form updated successfully!');
      } else if (!advisingTerm) {
        const response = await axios.post('http://localhost:4000/advising/submit-advising', {
          lastTerm,
          lastGPA,
          advisingTerm: advisingTermField,
          prerequisites,
          coursePlan,
        }, { withCredentials: true });
        if (response.data.error) {
          setError(response.data.error);
        } else {
          alert('Form submitted successfully!');
          navigate('/student/advising-history');
        }
      } else {
        setError('This advising record is not editable.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.message || 'Failed to submit the form. Please try again.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Container>
        <IconButton style={{ float: 'right' }} onClick={() => navigate('/home')}>
          <HomeIcon />
        </IconButton>
  
        <Typography variant="h4" gutterBottom>
          Course Advising Form
        </Typography>
  
        {error && <Alert severity="error">{error}</Alert>}
  
        {/* History Section */}
<Typography variant="h6">History</Typography>
<Grid container spacing={2}>
  <Grid item xs={12} sm={4}>
    <TextField 
      label="Last Term" 
      value={lastTerm || ''} 
      onChange={(e) => {
        if (!isEditable) {
          setLastTerm(e.target.value);
        } else {
          setError('Last term cannot be changed while editing.');
        }
      }} 
      fullWidth 
      required 
      disabled={isEditable} // Disable when form is being edited
    />
  </Grid>
  <Grid item xs={12} sm={4}>
    <TextField 
      label="Last GPA" 
      value={lastGPA || ''} 
      onChange={(e) => setLastGPA(e.target.value)} 
      fullWidth 
      required 
    />
  </Grid>
  <Grid item xs={12} sm={4}>
    <TextField 
      label="Advising Term" 
      value={advisingTermField || ''} 
      onChange={(e) => {
        if (!isEditable) {
          setAdvisingTerm(e.target.value);
        } else {
          setError('Advising term cannot be changed while editing.');
        }
      }} 
      fullWidth 
      required 
      disabled={isEditable} // Disable when form is being edited
    />
  </Grid>
</Grid>

        {/* Prerequisites Section */}
        <Typography variant="h6" style={{ marginTop: '20px' }}>Prerequisites</Typography>
        <Checkbox 
          checked={!enablePrerequisites} 
          onChange={(e) => setEnablePrerequisites(!e.target.checked)} 
          color="primary" 
        />
        Please check the box if the student has no prerequisite
  
        {enablePrerequisites &&
          (prerequisites || []).map((prerequisite, index) => (
            <Grid container spacing={2} key={`prerequisite-${index}`}>
              <Grid item xs={12} sm={4}>
                <Select
                  value={prerequisite.level || ''}
                  onChange={(e) => handleChangePrerequisiteLevel(index, e.target.value)}
                  fullWidth
                  required
                >
                  {getUniqueLevels(100, 300, enabledCourses).map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={7}>
                <Select
                  value={prerequisite.courseName || ''}
                  onChange={(e) => handleChangePrerequisiteCourse(index, e.target.value)}
                  fullWidth
                  required
                  disabled={!prerequisite.level} // Disable if level isn't selected
                >
                  {getCoursesByLevel(prerequisite.level, enabledCourses).map(course => (
                    <MenuItem key={course.id} value={course.course_name}>
                      {course.course_name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton onClick={() => handleDeletePrerequisite(index)} sx={{ color: 'gray' }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        {enablePrerequisites && (
          <IconButton onClick={handleAddPrerequisite} color="primary">
            <AddCircleIcon /> Add Prerequisite
          </IconButton>
        )}
  
        {/* Course Plan Section */}
        <Typography variant="h6" style={{ marginTop: '20px' }}>Course Plan</Typography>
        {(coursePlan || []).map((course, index) => (
          <Grid container spacing={2} key={`coursePlan-${index}`}>
            <Grid item xs={12} sm={4}>
              <Select
                value={course.level || ''}
                onChange={(e) => handleChangeCoursePlanLevel(index, e.target.value)}
                fullWidth
                required
              >
                {getUniqueLevels(400, 800, coursePlanCatalog).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={7}>
              <Select
                value={course.courseName || ''}
                onChange={(e) => handleChangeCoursePlanCourse(index, e.target.value)}
                fullWidth
                required
                disabled={!course.level} // Disable if level isn't selected
              >
                {getCoursesByLevel(course.level, coursePlanCatalog).map(course => (
                  <MenuItem key={course.id} value={course.course_name}>
                    {course.course_name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton onClick={() => handleDeleteCoursePlan(index)} sx={{ color: 'gray' }}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <IconButton onClick={handleAddCoursePlan} color="primary">
          <AddCircleIcon /> Add Course Plan
        </IconButton>
  
        {/* Submit Section */}
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ backgroundColor: 'primary', color: '#fff' }} // Sets blue background and white text
          >
            {advisingTerm ? 'Update Advising Form' : 'Submit Advising Form'}
          </Button>
        </Box>
      </Container>
    </Box>
  );  
};

export default CourseAdvisingForm;
