import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/projects/');
        setProjects(response.data.projects);
        setFilteredProjects(response.data.projects);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter projects whenever searchTerm changes
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = projects.filter(project => 
        project.title.toLowerCase().includes(lowercasedTerm) || 
        project.head.toLowerCase().includes(lowercasedTerm) ||
        (project.category && project.category.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  return (
    <Container className="py-4">
      <h1 className="mb-4">Explore Campaigns</h1>
      
      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <InputGroup>
            <Form.Control
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>
      
      {/* Projects Grid */}
      {loading ? (
        <p className="text-center">Loading projects...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-center">
          {searchTerm ? 'No projects match your search criteria.' : 'No projects available at the moment.'}
        </p>
      ) : (
        <Row>
          {filteredProjects.map(project => (
            <Col key={project.id} md={4} className="mb-4">
              <ProjectCard project={project} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ProjectsPage; 