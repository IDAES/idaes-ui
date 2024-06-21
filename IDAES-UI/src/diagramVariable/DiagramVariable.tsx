import { useContext, useEffect } from "react";
import { AppContext } from "@/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCaretRight, faCaretDown} from "@fortawesome/free-solid-svg-icons";

import css from "./DiagramVariable.module.css";

export default function DiagramVariable(){
	const {cells, model, showVariable, setShowVariable} = useContext(AppContext);
	console.log(cells)
	console.log(model)

	// initial display for each unit label
	let eachUnitLabelDisplay = "loading...";
	
	// use cells to build label for default label layout
	if(cells){
		eachUnitLabelDisplay = cells.map((el:any, index:number)=>{
			if(el.attrs && el.attrs.label && el.attrs.label.text){
				return (
					<li key={el.attrs.label.text + index} 
						id={`unit_name_${el}`} 
						className={css.variables_display_each_unit_label} 
						data-open="false" 
						data-which-label={el.attrs.label.text}
						onClick={(event)=>toggleVariableHandler(event, setShowVariable)}
					>
						{
							Object.keys(showVariable).includes(el.attrs.label.text) ?
								<FontAwesomeIcon icon={faCaretDown} />:
								<FontAwesomeIcon icon={faCaretRight} />
								
						}
						<span>{el.attrs.label.text}</span>
					</li>
				);
			}
		});
	}else{
		eachUnitLabelDisplay="Please check flowsheet Joint JS model, looks like it not contain any Cells";
	};

	// append child to each showed variables
	const showedVariableArr = Object.keys(showVariable)
	if(showedVariableArr.length > 0){
		// cons
	}

	return(
		<>
		<section className={`pd-md`}>
			<ul className={`${css.flowsheet_variable_ul}`}>
			{eachUnitLabelDisplay}
			</ul>
		</section>
		</>
	)
}

function toggleVariableHandler(event:React.MouseEvent, setShowVariable:any){
	/**
	 * Click on each unit label in variable component will open this label show detail or close
	 * this label.
	 * Args:
	 * 	event: react.mouse event
	 * 	setShowVariable: react state control which variable lable should open and show content
	 */
	// get event target read data-which lable from target
	const target = event.currentTarget;
	const whichVariable = target.getAttribute("data-which-label");
	// base on whichVariable update showVariable state
	if(whichVariable){
		console.log(`here`)
		setShowVariable((prevData:any)=>{
			const copyData = {...prevData};
			if(!copyData[whichVariable]){
				// when showVariable state not contain whichVariable
				copyData[whichVariable] = whichVariable
			}else{
				// when showVariable state contain whichVariable just remove it
				delete copyData[whichVariable]
			}

			return copyData;
		})
	}else{
		console.error("Click event not receive which variable")
	}
}

