import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import api from '../../services/api' 

import Container from '../../components/Container'
import { SubmitButton, Form, List } from './styles'

class Main extends Component{

    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        error404: false,
    };

    
    //Carregar os dados  do localStorage
    componentDidMount(){
        const repositories = localStorage.getItem('repositories')

        if (repositories){
            this.setState({
                 repositories: JSON.parse(repositories)
            }) 
        }
    }

    //Gravar os dados no localStorage
    componentDidUpdate(_, prevState){
        if (prevState.repositories !== this.state.repositories){
            localStorage.setItem('repositories', JSON.stringify(this.state.repositories))
        }
    }

    handleInputChange = e => {
        this.setState({
            newRepo:e.target.value
        })
    }

    repositorioRepetido = () => {
        const { repositories, newRepo } = this.state;
        const resultado = repositories.filter(repository => repository.name === newRepo)
        return resultado === [] ? false : true

    }

    handleSubmit = async e => {
        e.preventDefault();

        this.setState({
            loading: true
        })

        try{
            if (this.repositorioRepetido()){
                throw new Error('Repositório duplicado');
            }else{
                const { newRepo, repositories} = this.state;
            
                try{
                    const response = await api.get(`/repos/${newRepo}`)

                    const data = {
                        name: response.data.full_name
                    };
            
                    this.setState({
                        repositories: [...repositories, data],
                        newRepo: '',
                        loading: false,
                    })
                }catch{
                    throw new Error('Repositório não existe');
                }
            }
        }catch{
            this.setState({
                error404: true,
                loading: false,
            })  
        }
    
    }

    render(){
        const { newRepo, repositories, loading, error404 } = this.state;
        return (
            <Container>
                <h1>
                    <FaGithubAlt/>
                    Repositórios
                </h1>
                <Form onSubmit={this.handleSubmit} error404={error404}>
                    <input 
                        type="text"
                        placeholder="Adicionar repositório"
                        value={newRepo}
                        onChange={this.handleInputChange}
                    />
                    <SubmitButton loading={loading}>
                        {loading ? (
                            <FaSpinner color="#FFF" size={14}/>
                        ) : (
                            <FaPlus color="#FFF" size={14} />
                        )}
                    </SubmitButton>
                </Form>
                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                             <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
                        </li>
                    ))}
                </List>
            </Container>
        )
    }
}

export default Main;