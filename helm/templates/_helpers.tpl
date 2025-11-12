{{- define "fullname" -}}
{{- printf "%s" .Release.Name -}}
{{- end -}}


{{- define "frontend.fullname" -}}
{{- printf "%s-frontend" (include "fullname" .) -}}
{{- end -}}

{{- define "signalling.fullname" -}}
{{- printf "%s-signalling" (include "fullname" .) -}}
{{- end -}}

{{- define "keycloak.fullname" -}}
{{- printf "%s-keycloak" (include "fullname" .) -}}
{{- end -}}

{{- define "grafana.fullname" -}}
{{- printf "%s-grafana" (include "fullname" .) -}}
{{- end -}}

{{- define "loki.fullname" -}}
{{- printf "%s-loki" (include "fullname" .) -}}
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


{{- define "chartname" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "frontend.labels" -}}
{{ include "frontend.selectorLabels" . }}
app.kubernetes.io/component: frontend-server
{{ include "common.metadataLabels" . }}
{{- end }}

{{- define "signalling.labels" -}}
{{ include "signalling.selectorLabels" . }}
app.kubernetes.io/component: WebRTC-signalling-server
{{ include "common.metadataLabels" . }}
{{- end }}

{{- define "keycloak.labels" -}}
{{ include "keycloak.selectorLabels" . }}
app.kubernetes.io/component: authentication-server
{{ include "common.metadataLabels" . }}
{{- end }}

{{- define "postgres.labels" -}}
{{ include "postgres.selectorLabels" . }}
{{ include "common.metadataLabels" . }}
app.kubernetes.io/component: auth-database
{{- end }}

{{- define "common.labels" -}}
{{ include "common.selectorLabels" . }}
{{ include "common.metadataLabels" . }}
{{- end }}

{{- define "common.metadataLabels" -}}
helm.sh/chart: {{ include "chartname" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}



{{- define "frontend.selectorLabels" -}}
app.kubernetes.io/name: frontend
{{ include "common.selectorLabels" .}}
{{- end }}

{{- define "signalling.selectorLabels" -}}
app.kubernetes.io/name: signalling
{{ include "common.selectorLabels" .}}
{{- end }}

{{- define "keycloak.selectorLabels" -}}
app.kubernetes.io/name: keycloak
{{ include "common.selectorLabels" .}}
{{- end }}

{{- define "postgres.selectorLabels" -}}
app.kubernetes.io/name: postgres
{{ include "common.selectorLabels" . }}
{{- end }}

{{- define "common.selectorLabels" -}}
app.kubernetes.io/part-of: {{ include "fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}


{{- define "signalling.ws.uri" -}}
{{- printf "wss://%s:%s/%s" .Values.signalling.host .Values.signalling.port .Values.signalling.ws.path -}}
{{- end -}}


