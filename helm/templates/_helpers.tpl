{{- define "fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name -}}
{{- end -}}


{{- define "frontend.fullname" -}}
{{- printf "%s-frontend" (include "fullname" .) -}}
{{- end -}}

{{- define "signalling.fullname" -}}
{{- printf "%s-signalling" (include "fullname" .) -}}
{{- end -}}

{{- define "ingress.fullname" -}}
{{- printf "%s-ingress" (include "fullname" .) -}}
{{- end -}}

{{- define "gateway.fullname" -}}
{{- printf "%s-gateway" (include "fullname" .) -}}
{{- end -}}
{{- define "gateway.route" -}}
{{- printf "%s-route" (include "gateway.fullname" .) -}}
{{- end -}}
{{- define "gateway.port" -}}
{{- printf "%s-port" (include "gateway.fullname" .) -}}
{{- end -}}




{{- define "signalling.ws.uri" -}}
{{- printf "wss://%s:%s/%s" .Values.signalling.host .Values.signalling.port .Values.signalling.ws.path -}}
{{- end -}}
