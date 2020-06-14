import React, { Component } from 'react'
import api from '../../services/api'
import Proptypes from 'prop-types'

import { Link } from 'react-router-dom'


import Container from '../../components/Container'
import { IssueList, IssueFilter, Loading, Owner } from './styles'

class Repository extends Component {

    static propTypes = {
        match: Proptypes.shape({
            params: Proptypes.shape({
                repository: Proptypes.string,
            })
        }).isRequired
    }

    state = {
        repository: {},
        issues: [],
        filterIssues: [
            {state: 'all', label:"Todos", active:true},
            {state: 'open', label:"Abertos", active:false},
            {state: 'closed', label:"Fechados", active:false}
        ],
        filterIndex: 0,
        loading: true,
    }

    async componentDidMount(){

        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const {filterIssues, filterIndex} = this.state;

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`), {
                params: {
                    state: filterIssues[filterIndex].state,
                    per_page: 5,
                },
            },
        ]);

        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        })
    }

    handleFilterChange = async (index) => {
        this.setState({
            filterIndex: index,
        })

        const { filterIssues } = this.state;

        const { match } = this.props;
        const repoName = decodeURIComponent(match.params.repository);
        
        const response = await api.get(`/repos/${repoName}/issues`, {
            params: {
              state: filterIssues[index].state,
              per_page: 5,
            },
          });
          
        this.setState({
            issues: response.data,
        })

    }

    render(){
        const {repository, issues, loading, filterIssues, filterIndex} = this.state;
        
        if(loading){
            return <Loading>Carregando</Loading>
        }else{
            return (
                <Container>
                    <Owner>
                        <Link to="/">Voltar aos repositórios</Link>
                        <img src={repository.owner.avatar_url} alt={repository.owner.avatar_url}/>
                        <h1>{repository.name}</h1>
                        <p>{repository.description}</p>
                    </Owner>
                    <IssueFilter active={filterIndex}>
                        {filterIssues.map((filter, index) => (
                        <button
                            type="button"
                            key={filter.label}
                            onClick={() => this.handleFilterChange(index)}
                        >
                            {filter.label}
                        </button>
                        ))}
                    </IssueFilter>
                    <IssueList>
                        {issues.map(issue => (
                            <li key={String(issue.id)}>
                                <img src={issue.user.avatar_url} alt={issue.user.login}/>
                                <div>
                                    <strong>
                                        <a href={issue.html_url}>{issue.title}</a>
                                        {issue.labels.map(label => (
                                            <span key={String(label.id)}>{label.name}</span>
                                        ))}
                                    </strong>
                                    <p>{issue.user.login}</p>
                                </div>
                            </li>
                        ))}
                    </IssueList>
                </Container>
            )
        }
        
    }
}

export default Repository;