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
            dt = DiagnosticsToolbox(original_flowsheet)

            # initial streamIO to catch diagnostics output or its default will print to terminal
            output_stream = io.StringIO()

            # base on request.function_name run diagnostics function
            match request.function_name:
                case "display_underconstrained_set":
                    dt.display_underconstrained_set(stream=output_stream)
                case "display_constraints_with_large_residuals":
                    dt.display_constraints_with_large_residuals(stream=output_stream)
                case "display_potential_evaluation_errors":
                    dt.display_potential_evaluation_errors(stream=output_stream)

            # read catched output content
            captured_output = output_stream.getvalue()

            # close StreamIO
            output_stream.close()

            return {"diagnostics_runner_result": captured_output}
