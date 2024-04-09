# package
import io
from fastapi import HTTPException
from idaes_ui.fv.models import DiagnosticsData, DiagnosticsException, DiagnosticsError
from idaes.core.util.model_diagnostics import DiagnosticsToolbox
from pydantic import BaseModel


class PostDiagnosticsRunnerRouteType(BaseModel):
    function_name: str


class PostDiagnosticsRunnerRoute:
    def __init__(self, fastAPIApp, flowsheet_manager):
        @fastAPIApp.post(
            "/api/post_diagnostics_runner", tags=["Post Diagnostics runner"]
        )
        def post_diagnostics_runner(request: PostDiagnosticsRunnerRouteType):
            # validate if request.function_name exist, if not return error
            if not request.function_name:
                raise HTTPException(
                    status_code=400, detail="Bad request, function_name undefined!"
                )

            # define authorized function name list
            authorized_function_name_list = [
                "display_underconstrained_set",
                "display_potential_evaluation_errors",
                "display_constraints_with_large_residuals",
            ]

            # validate if request.function_name is in authorized function name list, if not return error
            if request.function_name not in authorized_function_name_list:
                raise HTTPException(
                    status_code=400, detail="Bad request, function_name unauthorized!"
                )

            # get diagnosticsToolBox ready by using original_flowsheet
            original_flowsheet = flowsheet_manager.get_original_flowsheet()
            dt_instance = DiagnosticsToolbox(original_flowsheet)

            """
            base on request.function_name run diagnostics function, and use streamIO to capture
            diagnosticsToolBox output as return value return to frontend
            """
            # initial current function name
            function_name = request.function_name

            if hasattr(dt_instance, function_name):
                # read dt function from dt instance
                current_function = getattr(dt_instance, function_name)
                # initial streamIO use as stream to capture diagnostics output or its default will print to terminal
                output_stream = io.StringIO()
                # run current function
                current_function(stream=output_stream)

            else:
                # return error function not exists
                return {
                    "error": f"Error function name {function_name} is not exists in diagnosticsToolBox instance"
                }

            # read captured output content
            captured_output = output_stream.getvalue()

            # close StreamIO
            output_stream.close()

            return {"diagnostics_runner_result": captured_output}
