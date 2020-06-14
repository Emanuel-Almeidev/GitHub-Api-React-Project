import React, { Component } from 'react'
import api from '../../services/api'
import Proptypes from 'prop-types'

import { Link } from 'react-router-dom'


import Container from '../../components/Container'
import { IssueList, IssueFilter, Loading, Owner, PageActions } from './styles'

class Repository extends Component {

    static propTypes = {
        match: Proptypes.shape({
            params: Proptypes.shape({
                repository: Proptypes.string,
            })
        }).isRequired
    }

    state = {
        loading: true,
        repository: {},
        issues: [],
        filterIssues: [
            {state: 'all', label:"Todos", active:true},
            {state: 'open', label:"Abertos", active:false},
            {state: 'closed', label:"Fechados", active:false}
        ],
        filterIndex: 0,
        page: 1,
    }

    async componentDidMount(){

        const { match } = this.props;

        const { filterIssues, filterIndex } = this.state;
        
        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: filterIssues[filterIndex].state,
                    per_page: 5,
                },
            }),
        ]);

        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        })
    }

    loadIssues = async () => {
        const { match } = this.props;
        const { filterIssues, page, filterIndex } = this.state;
        
        const repoName = decodeURIComponent(match.params.repository);
        
        const response = await api.get(`/repos/${repoName}/issues`, {
            params: {
              state: filterIssues[filterIndex].state,
              per_page: 5,
              page, 
            },
          });
          
        this.setState({ issues: response.data })
    }

    handleFilterChange = async (filterIndex) => {
        await this.setState({ filterIndex: filterIndex })
        this.loadIssues()
    }

    handlePage = (action) =>{
        const { page } = this.state;
        
        this.setState({
            page: action === 'back'? page - 1 : page + 1
        })
        this.loadIssues()

    }

    render(){
        const {repository, issues, loading, filterIssues, filterIndex, page} = this.state;
        
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
                    <IssueList>
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
                    <PageActions>
                        <button
                            onClick={() => this.handlePage('back')}
                            >Anterior
                        </button>
                        <span>Página {page}</span>
                        <button
                            onClick={() => this.handlePage('next')}
                            >Próximo
                        </button>
                    </PageActions>
                    
                </Container>
            )
        }
        
    }
}

export default Repository;