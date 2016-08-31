'use babel';

import SourceFetchView from './source-fetch-view';
import { CompositeDisposable } from 'atom';
import request from 'request'
import cheerio from 'cheerio'
import google from 'google'

export default {

  sourceFetchView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.sourceFetchView = new SourceFetchView(state.sourceFetchViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sourceFetchView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'source-fetch:fetch': () => this.fetch()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.sourceFetchView.destroy();
  },

  serialize() {
    return {
      sourceFetchViewState: this.sourceFetchView.serialize()
    };
  },

  scrape(html){
    $=cheerio.load(html)
    return $('div.accepted-answer pre code').text()
  },

  fetch() {
    let editor
    let self = this
    if(editor=atom.workspace.getActiveTextEditor()){
      let query=editor.getSelectedText()
      let language=editor.getGrammar().name

      self.search(query,language).then((url)=>{
        atom.notifications.addSuccess('Found google results')
        return self.download(url)
      }).then((html) => {
        let answer = self.scrape(html)
        if (answer===''){
          atom.notifications.addWarning('No answer found')
        }
        else{
            editor.insertText(answer)
        }

      }).catch((error)=>{
        console.log(error)
        atom.notifications.addWarning(error.reason)
      })
}
  },

  // fetch() {
  //   // console.log('SourceFetch was toggled!');
  //   // return (
  //   //   this.modalPanel.isVisible() ?
  //   //   this.modalPanel.hide() :
  //   //   this.modalPanel.show()
  //   // );
  //   let editor
  //   let self = this
  //   if(editor=atom.workspace.getActiveTextEditor()){
  //     let selection=editor.getSelectedText()
  //     // let reversed=selection.split('').reverse().join('')
  //     // editor.insertText(reversed)
  //     // this.download(selection)
  //     this.download(selection).then((html)=>{
  //       let answer = self.scrape(html)
  //       if (answer===''){
  //         atom.notifications.addWarning('No answer found')
  //       }
  //       else{
  //           editor.insertText(answer)
  //       }
  //
  //     }).catch((error)=>{
  //       console.log(error)
  //       // atom.notifications.addWarning(error.reason)
  //     })
  //   }
  // },

  // search(query, language) {
  //     return new Promise((resolve, reject) => {
  //       let searchString = `${query} in ${language} site:stackoverflow.com`
  //
  //       google(searchString, (err, res) => {
  //         if (err) {
  //           reject({
  //             reason: 'A search error has occured :('
  //           })
  //         } else if (res.links.length === 0) {
  //           reject({
  //             reason: 'No results found :('
  //           })
  //         } else {
  //           resolve(res.links[0].href)
  //         }
  //       })
  //     })
  //   },
  search(query,language){
    return new Promise((resolve,reject)=>{
      let searchString=`${query} in ${language} site:stackoverflow.com`

      google(searchString,(err,res)=>{
        if(err){
          reject({
            reason: 'A search error has occured :'
          })
        }else if (res.links.length===0){
            reject({
              reason: 'No results found:'
            })
          } else {
            resolve(res.links[0].href)
          }
        })
    })
},

  // download(url){
  //   console.log('=====start======:url is : '+ url)
  //   request(url,(error,response,body) => {
  //     if(!error && response.statusCode==200){
  //       console.log(body)
  //     }
  //     else
  //     {
  //       console.log("error:" + error)
  //     }
  //   })
  // }
  download(url){
    console.log('=====start======:url is : '+ url)
    return new Promise((resolve,reject)=>{
      request(url,(error,response,body) => {
        if(!error && response.statusCode==200){
          resolve(body)
        }
        else
        {
          reject({
            reason: 'unable to download page'
          })
        }
      })
    })
  }
};
