import * as React from 'react';
import Option from "./Option";
import COption from "./COption";
import { urlGeneral, urlVersion } from "../General/GConst";


export interface IProps {
    optionList?: any[];
    url?: string;
    onChange?: any;
    displayProp?: string;
    valueProp?: string;
    authorization?: string;
    initialvalue?: number | string;
    id?: string;
    position?: "bottom";
}

export interface IState {
    displayValue: string;
    searchValue: string;
    value: string;
    showOption: boolean;
    showInput: boolean;
    activeItem: number;
    optionList: any[];
    optionElement: any[];
}

class Select extends React.Component<IProps, IState> {
    public static Option: typeof Option = Option;
    public static COption: typeof COption = COption;

    public static defaultProps: Partial<IProps> = {
        valueProp: "id",
        displayProp: "title"
    };


    ref: any;
    optionRef: any;
    optionContainer: any;
    constructor(props: IProps) {
        super(props);
        this.state = {
            displayValue: "",
            searchValue: "",
            value: "",
            showOption: false,
            showInput: true,
            activeItem: 0,
            optionList: [],
            optionElement: []
        };
        this.ref = React.createRef()
        this.optionRef = React.createRef();
        this.optionContainer = React.createRef();
    }

    getOptions = (url: string) => {
        let authorization: string = "" + localStorage!.getItem("Nili");
        if (this.props.authorization) {
            authorization = this.props.authorization
        }
        fetch(urlGeneral + urlVersion + url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authorization,
            },
        })
            .then(response => response.json())
            .then(json =>  this.setState({ optionList: json.data ? json.data : [] }, () => {
                this.setInitialValue()
                this.moveFocus()
                this.getChildren()
            }))
    }
    componentDidUpdate(prevProps: { url: string; }) {
        if(this.props.url){
            if(this.props.url !== prevProps.url){
                this.setState({
                    displayValue: "",
                    value: "",
                    searchValue: "",
                    activeItem: 0,
                }, () => {
                    this.props.onChange("")
                })
                this.getOptions(this.props.url)
            }
        }
    }

    hideOption = () => {
        const displayProp = this.props.displayProp ? this.props.displayProp : "title";
        const valueProp = this.props.valueProp ? this.props.valueProp : "id";
        let { displayValue, showInput } = this.state
        if (this.state.value !== "" && this.state.optionList) {
            const displayValueItem = this.state.optionList && this.state.optionList.filter(item => item[valueProp].toString() === this.state.value.toString())[0];
            displayValue = displayValueItem ? displayValueItem[displayProp] : ""
        }
        showInput = false;
        this.setState({ showOption: false, showInput, displayValue });
    }

    handleClickOutside = (e: any) => {
        if (this.optionRef.current && !this.optionRef.current.contains(e.target)) {
            this.hideOption()
        }
    }
    setInitialValue() {
        const displayProp = this.props.displayProp ? this.props.displayProp : "title";
        const valueProp = this.props.valueProp ? this.props.valueProp : "id";
        if (this.props.initialvalue !== undefined) {
            const displayValueItem: false | any[] = this.state.optionList.length > 0 &&
                this.state.optionList.filter(item => {
                    return this.props.initialvalue &&
                        item[valueProp].toString() === this.props.initialvalue.toString()
                });
            if (displayValueItem && displayValueItem.length > 0) {
                const displayValue = displayValueItem[0][displayProp]
                this.setState({ value: this.props.initialvalue.toString(), displayValue }, () => {
                    if (this.props.onChange) {
                        this.props.onChange(this.state.value)
                    }
                })
            }

        }
    }
    componentDidMount() {
        if (this.props.url) {
            this.getOptions(this.props.url)
        } else if (this.props.optionList) {
            this.setState({ optionList: this.props.optionList }, () => {
                this.setInitialValue();
                this.getChildren();
                this.moveFocus();
            })
        } else {
            this.getChildren();
            this.moveFocus();
        }
        document.addEventListener("mousedown", this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside);
    }



    optionHandler = (status: boolean) => {
        this.setState({ showOption: status, showInput: true, searchValue: "" }, () => {
            this.ref.current && this.ref.current.focus()
        })
    }

    onChangeHandler = (event: any) => {
        event.preventDefault();
        this.setState({ searchValue: event.target.value, displayValue: "", activeItem: 0 })
    }
    _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            if (this.state.optionList) {
                const displayProp = this.props.displayProp ? this.props.displayProp : "title";
                const valueProp = this.props.valueProp ? this.props.valueProp : "id";
                const matchData = this.state.searchValue.toLocaleLowerCase().trim()
                const datas = this.state.optionList.filter(data => data[displayProp].toLocaleLowerCase().trim().match(matchData));
                if(datas[this.state.activeItem]){
                    const id = datas[this.state.activeItem][valueProp];
                    const targetData = datas.filter(data => data[valueProp].toString() === id.toString())[0]
                    this.onSelectHandler(targetData)
                }
            }
        }
    }
    onSelectHandler = (data: any) => {
        const displayProp = this.props.displayProp ? this.props.displayProp : "title";
        const valueProp = this.props.valueProp ? this.props.valueProp : "id";
        this.setState({
            value: data.props ? data.props[valueProp].toString() : data[valueProp],
            displayValue: data.props ? data.props[displayProp] : data[displayProp],
            showOption: false,
            showInput: false,
            activeItem: 0
        }, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state.value)
            }
        })
    }

    moveFocus = () => {
        const displayProp = this.props.displayProp ? this.props.displayProp : "title";
        const node = this.ref.current;
        node.addEventListener('keydown', (e: any) => {
            const matchData = this.state.searchValue.toLocaleLowerCase().trim()
            const items: any[] = this.state.optionList ?
                this.state.optionList.filter(data => data[displayProp].toLocaleLowerCase().trim().match(matchData)) : [];
            let activeIndex = this.state.activeItem
            if (e.keyCode === 40 && activeIndex < (items.length - 1)) {
                activeIndex++
            }
            if (e.keyCode === 38 && activeIndex > 0) {
                activeIndex--
            }
            this.setState({ activeItem: activeIndex })
        });
    }


    getChildren = () => {
        const displayProp = this.props.displayProp ? this.props.displayProp : "title";
        const valueProp = this.props.valueProp ? this.props.valueProp : "id";
        let options: any[] = [];
        if (this.props.url || this.props.optionList) {
            options = [];
            this.state.optionList.forEach((option: any, i: number) => {
                const optionElement = (z: number) => (<div key={i} id={option[valueProp]}
                    className={z === option[valueProp] ? "selectOption activeOption" : "selectOption"}
                    onClick={() => {
                        this.onSelectHandler(option)
                    }}>
                    {option[displayProp]}
                </div>)
                options.push({ [valueProp]: option[valueProp], [displayProp]: option[displayProp], optionElement })
            })
            this.setState({ optionList: options })
        }else {
        React.Children.forEach(this.props.children, (x, i) => {
            let y = x as React.ReactElement;
            if (y.type === Option) {
                const optionElement = (z: number) => (<div key={y.props[valueProp]}
                    id={y.props[valueProp]}
                    className={z === y.props[valueProp] ? "selectOption activeOption" : "selectOption"}
                    onClick={() => {
                        this.onSelectHandler(y)
                    }}>
                    {y.props[displayProp]}
                </div>)
                options.push({ [valueProp]: y.props[valueProp], [displayProp]: y.props[displayProp], optionElement })

            }
            if (y.type === COption) {
                const optionElement = (z: number) => (<div key={y.props[valueProp]} id={y.props[valueProp]}
                    className={z === y.props[valueProp] ? "selectOption activeOption" : "selectOption"}
                    onClick={() => this.onSelectHandler(y)}>
                    {typeof y.props.children === "function" ? y.props.children(y.props) : y.props.children}
                </div>)
                options.push({ [valueProp]: y.props[valueProp], [displayProp]: y.props[displayProp], optionElement })
            }
        });
        this.setState({ optionList: options })
    }

    }

    private renderOptionList = (options: any) => {
        const displayProp = this.props.displayProp ? this.props.displayProp : "title";
        const valueProp = this.props.valueProp ? this.props.valueProp : "id";
        if (this.state.searchValue !== "" && options.length > 0) {
            const matchData = this.state.searchValue.toLocaleLowerCase().trim()
            options = options.filter((option: any) => option[displayProp].toLocaleLowerCase().trim().match(matchData));
        }
        if(!options){
            return null
        }
        return options.map((option: any) => {
            return (option.optionElement ? option.optionElement(options[this.state.activeItem][valueProp]) : null)
        })
    }

    render() {
        return (
            <div className="selecContainer" ref={this.optionRef}>
                <div className="displayContainer" onClick={() => this.optionHandler(true)}>
                    <div className="inputContainer">
                        <input
                            id={this.props.id}
                            tabIndex={1}
                            className="selectInput" ref={this.ref} onKeyDown={this._handleKeyDown}
                            onBlur={this.hideOption}
                            style={{
                                display: this.state.showInput ? "block" : "none",
                                width: this.state.searchValue.length === 0 ? "19px" : (this.state.searchValue.length * 9) + "px"
                            }}
                            type="text" 
                            onChange={(event) => this.onChangeHandler(event)} 
                            value={this.state.searchValue} />
                    </div>
                    <div className="selectDisplay">
                        {this.state.displayValue}
                    </div>
                    <div className="selectBtn">
                        \/
                    </div>
                </div>
                <div ref={this.optionContainer} tabIndex={-1} style={this.props.position === "bottom" ? {bottom: "100%"} : { top: "100%"}}
                    className={this.state.showOption ? "optionContainer" : "optionContainer optionHide"}>
                    {this.renderOptionList(this.state.optionList)}
                </div>
            </div>
        );
    }
}

export default Select;