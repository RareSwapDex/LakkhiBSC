import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/projects/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data.projects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handlePublishProject = async (projectId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/publish/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state to reflect the change
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, live: true } : project
      ));
    } catch (error) {
      console.error('Error publishing project:', error);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>Admin Dashboard</h1>
        </Col>
        <Col className="text-end">
          <Link to="/admin/create-campaign">
            <Button variant="primary">Create New Campaign</Button>
          </Link>
        </Col>
      </Row>

      <Card className="admin-dashboard mb-4">
        <Card.Body>
          <h2 className="mb-4">Project Management</h2>
          
          {loading ? (
            <p>Loading projects...</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Target Amount</th>
                  <th>Raised Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map(project => (
                    <tr key={project.id}>
                      <td>{project.id}</td>
                      <td>{project.title}</td>
                      <td>{project.category || 'N/A'}</td>
                      <td>${project.fund_amount}</td>
                      <td>${project.raised_amount || 0}</td>
                      <td>
                        {project.live ? (
                          <span className="text-success">Live</span>
                        ) : (
                          <span className="text-warning">Draft</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/projects/${project.id}`} className="btn btn-sm btn-info me-2">
                          View
                        </Link>
                        {!project.live && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handlePublishProject(project.id)}
                          >
                            Publish
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No projects found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard; 