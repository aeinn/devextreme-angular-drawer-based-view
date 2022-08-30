import { Component, OnInit, ViewEncapsulation, AfterViewInit, Input, ViewChild, HostListener } from '@angular/core'
import { Router } from '@angular/router'

@Component({
    selector: 'app-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class drawerComponent implements OnInit, AfterViewInit {
    @ViewChild('sideNav', {static: false}) sideNav
    @Input() navItems: any

    //toolbars content and config//////////////////
        cmpyOwnName:string = ""
        userName:string = ""
        title:string = "G Software"
        sideNavButtonOptions: any
        themesOptions: any
        dynamicLocateInMenu: string = "auto"
    //toolbars content and config///////////////////
    isDrawerOpen = false

    currentSearch: any
    searchEditorOptions: any
    recentSearch : string

    badgeMessage:string = ''
    socket: SocketIOClient.Socket

    //list of theme for client to select
    listOfThemes = [
        'carmine',
        'contrast',
        'dark',
        'dark moon',
        'dark violet',
        'light',
        'soft blue'
    ]

    constructor(private router: Router) {
        // this.socket = io.connect('https://gsoftapps.com.my/GSOFT')
        this.searchEditorOptions = {
            elementAttr: {id: 'navSearch'},
            buttons : [                     //button for recall back previous key in wording
                {
                    name: 'recent',
                    location: 'after',
                    options: {
                        icon: 'revert',
                        hint: 'last searched item',
                        onClick: (e) => {
                            this.sideNav.instance.option({
                                searchValue: this.recentSearch
                            })
                        }
                    }
                }
            ]
        }
        this.sideNavButtonOptions = {
            accessKey: 'm',                //alt + m keypress consider press the Menu button
            icon: 'menu',
            onClick: () => {
                if(!this.isDrawerOpen){
                    //cache previous searched, then clear the search value
                    this.recentSearch = this.sideNav.instance.option().searchValue
                    this.sideNav.instance.option({
                        searchValue: ""
                    })

                    document.getElementById('navSearch')
                    .getElementsByTagName('input')[0]
                    .focus()                //set focus on nvaSearch
                }
                
                this.isDrawerOpen = !this.isDrawerOpen
            }
        }
        this.themesOptions = {
            text: "themes",
            items: this.listOfThemes,
            value: "",
            width: '200px',
            onItemClick: (e) => {
                let selectedTheme = e.itemData
                //remove the spacing (' ') in selectTheme
                selectedTheme = selectedTheme.replace(/\s+/g, '');
                //cache the selected theme on local storage to so it remember user options
                window.localStorage.setItem("dx_theme", selectedTheme)
            
                //find the old theme and replace the href with new one
                const oldTheme = document.getElementById("dx-theme")
                oldTheme.setAttribute("href", `https://cdnjs.cloudflare.com/ajax/libs/devextreme/22.1.3/css/dx.${selectedTheme}.css`)
            }
        }
    }

    ngOnInit() {
        this.themeInit()
        if(this.isMobile()){
            this.dynamicLocateInMenu = "always"
        }

        this.userName = "username"
        this.title = "title"
    }

    ngAfterViewInit(): void {}

    selectItem(e) {
        const itemSelected = e.itemData;
        if(itemSelected.route !== '') {
            this.router.navigate([itemSelected.route]);
            this.isDrawerOpen = false
        }else{
            e.component.expandItem(itemSelected)

            this.navItems.forEach(x => {
                if(itemSelected === x || x.id === itemSelected.parentId || x.id == Math.floor(itemSelected.id/10000) || x.id == Math.floor(itemSelected.id/1000000)){
                    //condition: 
                    // *if is the current selected item
                    //or
                    // *if the item belongs to the selected parent
                    // or
                    // *if the item is the parent of the parent of selected item
                    // or
                    // *if the item is the parent of the parent of the parent of the selected item
    
                    //ignore it
                } else {
                    //collapse all other items that did not met above condition
                    e.component.collapseItem(x)
                }
            })
        }
    }

    goHome(){
        this.isDrawerOpen = false
        this.router.navigate(['']);
    }

    // **************************************************************
    // ********************** devExtremeTheme *****************************
    // **************************************************************

    themeInit(){
        // const devextremeCommon = document.createElement("link")
        // devextremeCommon.setAttribute("rel", "stylesheet")
        // devextremeCommon.setAttribute("href", `https://cdn3.devexpress.com/jslib/22.1.3/css/dx.common.css`)
        // devextremeCommon.setAttribute("integrity", "sha384-17Gk0uwzG/00XhiaxUx3xv/spHR5bJUYn5I0WgiM9lQJggWNnxmdjn0itnCJq0+D sha512-4mq17Y3+eh7clLtvSr5zbTM3+NDCUbOamW4MzRO6yQxH8pYk0xIMrHsAgM6jr7zYuXl1wJw37142CpHKoBD1WQ==")
        // devextremeCommon.setAttribute("crossorigin", "anonymous")

        // // const htmlHead = document.getElementsByTagName("head")[0]
        // document.getElementById("googleFont")
        // .insertAdjacentElement("afterend",devextremeCommon)

        //create CSS link for html.head
        //default using 'light' if dx-theme is not found
        const theme = window.localStorage.getItem("dx_theme") || "light"
        
        //actually is create this line in index.html: <link rel="dx-theme" data-theme="generic.light" href="https://www.gsoftapps.com.my/theme/dx.light.css" data-active="false" />
        const link = document.createElement("link")
        link.setAttribute("id", "dx-theme")
        link.setAttribute("rel", "stylesheet")
        link.setAttribute("href", `https://cdnjs.cloudflare.com/ajax/libs/devextreme/22.1.3/css/dx.${theme}.css`)
        
        // insert theme css under devExtreme common css
        const devextremeCommon = document.getElementById("devExtremeCommon")
        devextremeCommon.insertAdjacentElement("afterend", link)
    }

    // **************************************************************
    // ********************** Mobile UI *****************************
    // **************************************************************

    isMobile(){
        // https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
        //check if is using mobile browser
        return [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ].some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem)
        })
    }
    // ********************** mobile UI *****************************
}
