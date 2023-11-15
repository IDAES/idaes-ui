# package
from idaes_ui.fv.models import DiagnosticsData, DiagnosticsException, DiagnosticsError


class GetDiagnosticsRoute:
    def __init__(self, fastAPIApp, flowsheet):
        @fastAPIApp.get("/api/get_diagnostics", tags=["Get Diagnostics"])
        def get_diagnostics(self, flowsheet) -> DiagnosticsData:
            diag_data = DiagnosticsData(flowsheet)
            try:
                return diag_data
            except DiagnosticsException as exc:
                error_json = DiagnosticsError.from_exception(exc).model_dump_json()
                raise HTTPException(status_code=500, detail=error_json)
