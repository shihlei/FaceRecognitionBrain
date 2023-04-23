import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input:'',
  imageUrl:'',//url應該要在點擊submit後顯示
  box: {}, //include values we receive
  route: 'signin',//從signin開始
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0, //記錄分數
    joined: '' //自動建立日期 
  }
}

class App extends Component {
  constructor(){//宣告state
    super(); //呼叫parent 的constructor，很重要！！
    this.state = initialState;//state為在App中改變的內容
  }

  loadUser = (data) => {
    //update user that we receive
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries, 
      joined: data.joined 
    }})
  }

  //這個function會return object
  claculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  //receive claculateFaceLocation's return value
  displayFaceBox = (box) =>{
    //state(box) set with box
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    //update input component
    this.setState({input : event.target.value});//拿value
  }

  onButtonSubmit = () =>{
    //當imageUrl拿到input後會update
    //pass imageUrl to FaceRecognition
    this.setState({imageUrl:this.state.input});
      fetch('https://facerecognitionappbackend-api.onrender.com/imageurl', {//用來在前端隱藏api key，移到後端做
        method: 'post',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())//因為是fetch，所以要做response.json()
      .then(response => {
        if(response){
          fetch('https://facerecognitionappbackend-api.onrender.com/image', {
            method: 'put',
            //header is object
            headers: {'Content-type': 'application/json'},
            //object所以要包json
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              //update count
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
            .catch(console.log)//error handling
        }
        this.displayFaceBox(this.claculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  //當有人signin之後進入home頁面
  onRouteChange = (route) => {
    if(route ==='signout'){
      this.setState(initialState)
    }
    else if(route ==='home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    const {isSignedIn, route, box, imageUrl} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
            params={particlesOptions}
          />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route ==='home' 
          //click之後，route會變成signin
          //html用{}包起來就會變成js格式
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange = {this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>
          :(
            this.state.route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            ) 
        } 
      </div> 
    );
  }
  
}

export default App;
