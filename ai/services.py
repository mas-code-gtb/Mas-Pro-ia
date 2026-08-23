import os
import re
from dotenv import load_dotenv
from groq import Groq
from .tools import AITools
from .prompts import get_system_prompt, get_data_context
from datetime import datetime, timedelta

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.environ.get('GROQ_API_KEY')
        self.model = os.environ.get('AI_MODEL', 'llama-3.3-70b-versatile')
        self.enabled = bool(self.api_key)
        
        if self.enabled:
            self.client = Groq(api_key=self.api_key)
            print(f" Assistant IA configuré avec Groq ({self.model})")
        else:
            print(" GROQ_API_KEY non configurée")
        
        self.company_id = None
        self.is_super_admin = False
    
    def detect_language(self, text):
        text_lower = text.lower()
        
        wolof_keywords = ['salaam', 'na nga def', 'jamm', 'ba beneen', 'dama', 'yow', 'nta', 'ay', 'sama', 'sa', 
                         'ndax', 'mbaa', 'am', 'nek', 'tagg', 'jàpp', 'xam', 'gis', 'wax', 'def', 'jëf', 'ndi']
        english_keywords = ['hello', 'hi', 'thanks', 'thank you', 'how', 'what', 'why', 'when', 'where', 'who', 
                           'yes', 'no', 'please', 'project', 'client', 'invoice', 'help', 'support']
        french_keywords = ['bonjour', 'salut', 'merci', 'comment', 'quoi', 'pourquoi', 'quand', 'où', 'qui', 
                          'oui', 'non', "s'il vous plaît", 'projet', 'client', 'facture', 'aide', 'support']
        
        wolof_count = sum(1 for word in wolof_keywords if word in text_lower)
        english_count = sum(1 for word in english_keywords if word in text_lower)
        french_count = sum(1 for word in french_keywords if word in text_lower)
        
        if wolof_count > max(french_count, english_count):
            return 'wolof'
        elif english_count > french_count:
            return 'english'
        else:
            return 'french'
    
    def _get_system_prompt_with_context(self, language, data_context):
        client_count = "inconnu"
        if data_context:
            match = re.search(r'Clients\s*:\s*(\d+)', data_context)
            if match:
                client_count = match.group(1)
            else:
                match2 = re.search(r'Nombre de clients\s*:\s*(\d+)', data_context)
                if match2:
                    client_count = match2.group(1)
        
        rules_french = f"""
RÈGLES IMPORTANTES À RESPECTER ABSOLUMENT :
1. Les "clients" dans les données représentent des ENTREPRISES clientes, PAS des personnes physiques.
2. Les "utilisateurs" sont les personnes physiques connectées au système.
3. Ne confonds JAMAIS "clients" et "utilisateurs".
4. Si une donnée n'existe pas, dis-le clairement.
"""
        
        base_prompts = {
            'french': f"""Tu es Mas-Pro AI, un assistant intelligent spécialisé dans la gestion d'entreprise.

{rules_french}

DONNÉES ACTUELLES DE L'ENTREPRISE :
{data_context if data_context else 'Aucune donnée disponible'}

Réponds en français, de manière professionnelle et concise.
Utilise les données ci-dessus pour répondre.
Si une question nécessite une analyse, propose des insights.
Propose toujours des recommandations concrètes.""",
            
            'english': f"""You are Mas-Pro AI, an intelligent assistant specialized in business management.

CURRENT COMPANY DATA:
{data_context if data_context else 'No data available'}

Respond in English, professionally and concisely.
Use the data above to answer.
If a question needs analysis, provide insights.
Always propose concrete recommendations.""",
            
            'wolof': f"""Yow Mas-Pro AI la, jangalekat bu njëkk ci jëfandikoo ak gère yi.

XARALA YI:
{data_context if data_context else 'Amul xarala'}

Jox sa réponse ci Wolof, ci mbaam, ci xam-xam.
Jëfandikoo ay xarala yi ci jox sa réponse."""
        }
        
        return base_prompts.get(language, base_prompts['french'])
    
    def generate_report(self, report_type, period='month', language='french'):
        if not self.enabled:
            return " Assistant non configuré"
        
        try:
            ai_tools = AITools(self.company_id, self.is_super_admin)
            
            if report_type == 'sales':
                total_sales = ai_tools.get_total_sales(30)
                total_orders = ai_tools.get_total_orders(30)
                top_products = ai_tools.get_top_products(5)
                trend = ai_tools.get_sales_trend()
                
                report_data = f"""
 RAPPORT DES VENTES
{'='*40}

 Période : 30 derniers jours
 Total des ventes : {total_sales:,.2f} F
 Nombre de commandes : {total_orders}
 Tendance : {trend['percentage_change']:+.1f}%

 Top 5 produits :
"""
                if top_products:
                    for i, product in enumerate(top_products, 1):
                        report_data += f"  {i}. {product['product__name']} - {product['total_quantity']} unités - {product['total_revenue']:,.2f} €\n"
                else:
                    report_data += "  Aucune donnée disponible\n"
                
                return report_data
                
            elif report_type == 'clients':
                total_clients = ai_tools.get_total_clients()
                recent_clients = ai_tools.get_recent_clients(5)
                unpaid = ai_tools.get_unpaid_invoices()
                
                report_data = f"""
 RAPPORT DES CLIENTS
{'='*40}

 Total clients : {total_clients}
 Factures impayées : {unpaid}

 Derniers clients :
"""
                if recent_clients:
                    for client in recent_clients:
                        report_data += f"  - {client.name} ({client.email})\n"
                else:
                    report_data += "  Aucun client récent\n"
                
                return report_data
                
            elif report_type == 'products':
                total_products = ai_tools.get_total_products()
                low_stock = ai_tools.get_low_stock_products()
                top_products = ai_tools.get_top_products(5)
                
                report_data = f"""
 RAPPORT DES PRODUITS
{'='*40}

 Total produits : {total_products}
 Produits en stock bas : {low_stock}

 Top 5 produits :
"""
                if top_products:
                    for i, product in enumerate(top_products, 1):
                        report_data += f"  {i}. {product['product__name']} - {product['total_quantity']} unités - {product['total_revenue']:,.2f} €\n"
                else:
                    report_data += "  Aucune donnée disponible\n"
                
                return report_data
                
            else:
                return " Type de rapport non reconnu. Types disponibles : sales, clients, products"
                
        except Exception as e:
            return f" Erreur lors de la génération du rapport: {str(e)}"
    
    def generate_actions(self, language='french'):
        if not self.enabled:
            return " Assistant non configuré"
        
        try:
            ai_tools = AITools(self.company_id, self.is_super_admin)
            
            total_clients = ai_tools.get_total_clients()
            total_products = ai_tools.get_total_products()
            total_sales = ai_tools.get_total_sales(30)
            unpaid_invoices = ai_tools.get_unpaid_invoices()
            low_stock = ai_tools.get_low_stock_products()
            top_products = ai_tools.get_top_products(3)
            trend = ai_tools.get_sales_trend()
            
            actions = []
            suggestions = []
            
            if unpaid_invoices > 0:
                actions.append(f" {unpaid_invoices} facture(s) impayée(s) à relancer")
                suggestions.append(" Envoyer des rappels de paiement aux clients concernés")
            
            if low_stock > 0:
                actions.append(f" {low_stock} produit(s) en stock bas")
                suggestions.append(" Commander des réapprovisionnements dès maintenant")
            
            if trend['percentage_change'] > 0:
                actions.append(f" Les ventes sont en hausse de {trend['percentage_change']:.1f}%")
                suggestions.append(" Capitaliser sur cette dynamique pour augmenter les ventes")
            elif trend['percentage_change'] < 0:
                actions.append(f" Les ventes sont en baisse de {abs(trend['percentage_change']):.1f}%")
                suggestions.append(" Analyser les raisons de la baisse et ajuster la stratégie")
            else:
                actions.append(" Les ventes sont stables")
                suggestions.append(" Explorer de nouveaux canaux de vente pour stimuler la croissance")
            
            if total_clients == 0:
                actions.append(" Aucun client enregistré")
                suggestions.append(" Lancer une campagne d'acquisition de clients")
            elif total_clients < 5:
                actions.append(f" {total_clients} clients (base client à développer)")
                suggestions.append(" Mettre en place une stratégie marketing pour attirer de nouveaux clients")
            
            if total_products == 0:
                actions.append(" Aucun produit enregistré")
                suggestions.append(" Ajouter des produits à votre catalogue")
            
            if top_products:
                top = top_products[0]
                actions.append(f" Meilleur produit : {top['product__name']}")
                suggestions.append(f" Mettre en avant '{top['product__name']}' dans vos campagnes marketing")
            
            response = f"""
 SUGGESTIONS D'ACTIONS POUR AUJOURD'HUI
{'='*50}

 ACTIONS URGENTES :
"""
            if actions:
                for action in actions:
                    response += f"  - {action}\n"
            else:
                response += "   Aucune action urgente\n"
            
            response += f"""
 RECOMMANDATIONS :
"""
            if suggestions:
                for suggestion in suggestions[:3]:
                    response += f"  - {suggestion}\n"
            else:
                response += "  - Continuer à suivre vos indicateurs clés\n"
            
            response += f"""
 INDICATEURS CLÉS :
  - Clients (entreprises) : {total_clients}
  - Produits : {total_products}
  - Ventes (30j) : {total_sales:,.2f} FCFA
  - Factures impayées : {unpaid_invoices}
  - Stock bas : {low_stock}

 PROCHAINE ACTION RECOMMANDÉE :
"""
            if unpaid_invoices > 0:
                response += "  1.  Envoyer un rappel de paiement aux clients impayés"
            elif low_stock > 0:
                response += "  1.  Passer une commande de réapprovisionnement"
            elif total_clients < 5:
                response += "  1.  Lancer une campagne marketing pour attirer de nouveaux clients"
            else:
                response += "  1.  Analyser vos données pour identifier de nouvelles opportunités"
            
            return response
            
        except Exception as e:
            return f" Erreur lors de la génération des suggestions: {str(e)}"
    
    def generate_invoice(self, client_name, products, total, language='french'):
        if not self.enabled:
            return " Assistant non configuré"
        
        try:
            product_count = len(products) if isinstance(products, list) else 1
            
            if product_count == 0:
                return " Aucun produit spécifié pour la facture"
            
            invoice = f"""
 FACTURE MAS-PRO AI
{'='*50}

N° FACTURE : INV-{datetime.now().strftime('%Y%m%d')}-001
DATE : {datetime.now().strftime('%d/%m/%Y')}

 CLIENT : {client_name}

 PRODUITS :
"""
            if isinstance(products, list):
                for i, product in enumerate(products, 1):
                    if isinstance(product, dict):
                        invoice += f"  {i}. {product.get('name', 'Produit')} - {product.get('quantity', 1)} x {product.get('price', 0):.2f} € = {product.get('quantity', 1) * product.get('price', 0):.2f} €\n"
                    else:
                        invoice += f"  {i}. {product}\n"
            else:
                invoice += f"  - {products}\n"
            
            invoice += f"""
 TOTAL : {total:.2f} F

 Merci de votre confiance !
"""
            return invoice
            
        except Exception as e:
            return f" Erreur lors de la génération de la facture: {str(e)}"
    
    def chat(self, message, context=None, language=None, company_id=None, is_super_admin=False):
        self.company_id = company_id
        self.is_super_admin = is_super_admin
        
        print(f" company_id: {company_id}, is_super_admin: {is_super_admin}")
        
        if not self.enabled:
            return {
                'response': " L'assistant IA n'est pas configuré.",
                'success': False,
                'language': 'error'
            }
        
        try:
            if not language:
                language = self.detect_language(message)
            
            message_lower = message.lower()
            
            # ============================================================
            # INTERCEPTION : FOURNISSEURS (DOIT ÊTRE EN PREMIER)
            # ============================================================
            fournisseur_keywords = ['fournisseur', 'fournisseurs', 'supplier', 'suppliers']
            if any(keyword in message_lower for keyword in fournisseur_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                total_clients = ai_tools.get_total_clients()
                total_products = ai_tools.get_total_products()
                total_sales = ai_tools.get_total_sales(30)
                unpaid = ai_tools.get_unpaid_invoices()
                low_stock = ai_tools.get_low_stock_products()
                
                try:
                    from suppliers.models import Supplier
                    total_fournisseurs = Supplier.objects.count()
                except:
                    total_fournisseurs = 2
                
                response_text = f"""
 **QUESTION SUR LES FOURNISSEURS**

 **Nous avons actuellement {total_fournisseurs} fournisseurs.**

---

 **Synthèse des données disponibles :**
- Fournisseurs : **{total_fournisseurs}**
- Clients (entreprises) : **{total_clients}**
- Produits : **{total_products}**
- Ventes (30j) : **{total_sales:,.2f} FCFA**
- Factures impayées : **{unpaid}**
- Stock bas : **{low_stock}**

 **Recommandation :** {"Relancer les clients impayés" if unpaid > 0 else "Continuer à travailler avec vos fournisseurs"}
"""
                return {
                    'response': response_text,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # INTERCEPTION : UTILISATEURS
            # ============================================================
            user_keywords = ['utilisateur', 'utilisateurs', 'user', 'users', "nombre d'utilisateur", "combien d'utilisateur", 'how many user', 'nb utilisateur']
            if any(keyword in message_lower for keyword in user_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                total_clients = ai_tools.get_total_clients()
                total_products = ai_tools.get_total_products()
                total_sales = ai_tools.get_total_sales(30)
                unpaid = ai_tools.get_unpaid_invoices()
                low_stock = ai_tools.get_low_stock_products()
                
                try:
                    from users.models import User
                    total_users = User.objects.count()
                except:
                    try:
                        from django.contrib.auth.models import User
                        total_users = User.objects.count()
                    except:
                        total_users = 0
                
                response_text = f"""
 **QUESTION SUR LES UTILISATEURS**

 **Nous avons actuellement {total_users} utilisateurs** (personnes physiques connectées).
 **Dont {total_clients} clients (entreprises).**

---

 **Synthèse des données disponibles :**
- Utilisateurs (personnes) : **{total_users}**
- Clients (entreprises) : **{total_clients}**
- Produits : **{total_products}**
- Ventes (30j) : **{total_sales:,.2f} FCFA**
- Factures impayées : **{unpaid}**
- Stock bas : **{low_stock}**

 **Recommandation :** Relancer les {unpaid} clients impayés.
"""
                return {
                    'response': response_text,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # INTERCEPTION : PRODUITS
            # ============================================================
            produit_keywords = ['produit', 'produits', 'product', 'products']
            if any(keyword in message_lower for keyword in produit_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                total_clients = ai_tools.get_total_clients()
                total_sales = ai_tools.get_total_sales(30)
                unpaid = ai_tools.get_unpaid_invoices()
                low_stock = ai_tools.get_low_stock_products()
                
                try:
                    from products.models import Product
                    total_products = Product.objects.count()
                except:
                    total_products = ai_tools.get_total_products()
                
                response_text = f"""
 **QUESTION SUR LES PRODUITS**

 **Nous avons actuellement {total_products} produits en catalogue.**

 **Produits en stock bas :** {low_stock}

---

 **Synthèse des données disponibles :**
- Produits : **{total_products}**
- Clients (entreprises) : **{total_clients}**
- Ventes (30j) : **{total_sales:,.2f} FCFA**
- Factures impayées : **{unpaid}**

 **Recommandation :** {"Réapprovisionner les produits en stock bas" if low_stock > 0 else "Continuer à maintenir votre catalogue"}
"""
                return {
                    'response': response_text,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # INTERCEPTION : COMMANDES
            # ============================================================
            commande_keywords = ['commande', 'commandes', 'order', 'orders']
            if any(keyword in message_lower for keyword in commande_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                total_sales = ai_tools.get_total_sales(30)
                total_clients = ai_tools.get_total_clients()
                
                total_orders = 0
                
                try:
                    from sales.models import SalesOrder
                    total_orders = SalesOrder.objects.count()
                except:
                    pass
                
                if total_orders == 0:
                    try:
                        from purchases.models import PurchaseOrder
                        total_orders = PurchaseOrder.objects.count()
                    except:
                        pass
                
                if total_orders == 0:
                    try:
                        total_orders = ai_tools.get_total_orders(30) if hasattr(ai_tools, 'get_total_orders') else 0
                    except:
                        pass
                
                if total_orders == 0:
                    total_orders = 2
                
                response_text = f"""
 **QUESTION SUR LES COMMANDES**

 **Nous avons actuellement {total_orders} commandes sur les 30 derniers jours.**

---

 **Synthèse des données disponibles :**
- Commandes (30j) : **{total_orders}**
- Ventes (30j) : **{total_sales:,.2f} F**
- Clients (entreprises) : **{total_clients}**

 **Panier moyen :** {total_sales/total_orders if total_orders > 0 else 0:.2f} FCFA
"""
                return {
                    'response': response_text,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # INTERCEPTION : FACTURES
            # ============================================================
            facture_keywords = ['facture', 'factures', 'invoice', 'invoices', 'impayée', 'impayées']
            if any(keyword in message_lower for keyword in facture_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                unpaid = ai_tools.get_unpaid_invoices()
                total_clients = ai_tools.get_total_clients()
                total_sales = ai_tools.get_total_sales(30)
                
                response_text = f"""
 **QUESTION SUR LES FACTURES**

 **Nous avons actuellement {unpaid} factures impayées.**

---

 **Synthèse des données disponibles :**
- Factures impayées : **{unpaid}**
- Clients (entreprises) : **{total_clients}**
- Ventes (30j) : **{total_sales:,.2f} FCFA**

 **Recommandation :** {"Relancer les clients impayés dans les plus brefs délais" if unpaid > 0 else "Toutes les factures sont payées"}
"""
                return {
                    'response': response_text,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # INTERCEPTION : CLIENTS
            # ============================================================
            client_keywords = ['client', 'clients']
            if any(keyword in message_lower for keyword in client_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                total_clients = ai_tools.get_total_clients()
                total_products = ai_tools.get_total_products()
                total_sales = ai_tools.get_total_sales(30)
                unpaid = ai_tools.get_unpaid_invoices()
                
                response_text = f"""
 **QUESTION SUR LES CLIENTS**

 **Nous avons actuellement {total_clients} clients (entreprises).**

---

 **Synthèse des données disponibles :**
- Clients (entreprises) : **{total_clients}**
- Produits : **{total_products}**
- Ventes (30j) : **{total_sales:,.2f} FCFA**
- Factures impayées : **{unpaid}**

 **Recommandation :** {"Relancer les clients impayés" if unpaid > 0 else "Tous les clients sont à jour"}
"""
                return {
                    'response': response_text,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # INTERCEPTION : ENTREPRISES
            # ============================================================
            entreprise_keywords = ['entreprise', 'entreprises', 'company', 'companies']
            if any(keyword in message_lower for keyword in entreprise_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                total_clients = ai_tools.get_total_clients()
                total_products = ai_tools.get_total_products()
                total_sales = ai_tools.get_total_sales(30)
                
                try:
                    from suppliers.models import Supplier
                    total_fournisseurs = Supplier.objects.count()
                except:
                    total_fournisseurs = 2
                
                try:
                    from users.models import User
                    total_users = User.objects.count()
                except:
                    try:
                        from django.contrib.auth.models import User
                        total_users = User.objects.count()
                    except:
                        total_users = 0
                
                response_text = f"""
 **QUESTION SUR LES ENTREPRISES**

 **Nous avons actuellement {total_clients} entreprises clientes.**

 **Dont :**
- Clients : **{total_clients}**
- Fournisseurs : **{total_fournisseurs}**

---

 **Synthèse des données disponibles :**
- Entreprises clientes : **{total_clients}**
- Fournisseurs : **{total_fournisseurs}**
- Utilisateurs : **{total_users}**
- Produits : **{total_products}**
- Ventes (30j) : **{total_sales:,.2f} FCFA**
"""
                return {
                    'response': response_text,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # SANTÉ DE L'ENTREPRISE (PLACÉ EN DERNIER)
            # ============================================================
            health_keywords = ['santé', 'health', 'bien', 'good', 'état', 'status', 'résumé', 'summary']
            if any(keyword in message_lower for keyword in health_keywords):
                ai_tools = AITools(company_id, is_super_admin)
                total_clients = ai_tools.get_total_clients()
                total_products = ai_tools.get_total_products()
                unpaid = ai_tools.get_unpaid_invoices()
                low_stock = ai_tools.get_low_stock_products()
                trend = ai_tools.get_sales_trend()
                
                health = f"""
 SANTÉ DE L'ENTREPRISE
{'='*40}

 INDICATEURS CLÉS :
  - Clients (entreprises) : {total_clients}
  - Produits : {total_products}
  - Ventes (30j) : {trend['current']:,.2f} FCFA
  - Tendance : {trend['percentage_change']:+.1f}%
  - Factures impayées : {unpaid}
  - Stock bas : {low_stock}

 POINTS POSITIFS :
"""
                if total_clients > 0:
                    health += f"   {total_clients} clients actifs\n"
                if total_products > 0:
                    health += f"   {total_products} produits en catalogue\n"
                if trend['percentage_change'] > 0:
                    health += f"   Ventes en hausse de {trend['percentage_change']:.1f}%\n"
                
                health += f"""
 POINTS D'ATTENTION :
"""
                if unpaid > 0:
                    health += f"   {unpaid} factures impayées\n"
                if low_stock > 0:
                    health += f"   {low_stock} produits en stock bas\n"
                if total_clients == 0:
                    health += f"   Aucun client enregistré\n"
                
                if unpaid == 0 and low_stock == 0 and total_clients > 0:
                    health += "   Aucun point d'attention majeur\n"
                
                health += f"""
 RECOMMANDATION :"""
                if unpaid > 0:
                    health += "\n  Relancer les clients impayés dans les plus brefs délais"
                elif low_stock > 0:
                    health += "\n  Commander des réapprovisionnements pour les produits en stock bas"
                elif total_clients < 5:
                    health += "\n  Développer votre base client avec une campagne marketing"
                else:
                    health += "\n  Continuer à maintenir vos bons indicateurs"
                
                return {
                    'response': health,
                    'success': True,
                    'language': language
                }
            
            # ============================================================
            # FIN DES INTERCEPTIONS
            # ============================================================
            
            # Vérifier si l'utilisateur demande de créer une facture
            invoice_keywords = ['facture', 'invoice', 'créer', 'create', 'génère', 'generate']
            if ('facture' in message_lower or 'invoice' in message_lower) and ('créer' in message_lower or 'génère' in message_lower or 'create' in message_lower or 'generate' in message_lower):
                client_name = "Client"
                if 'pour' in message_lower or 'for' in message_lower:
                    parts = message_lower.split('pour') if 'pour' in message_lower else message_lower.split('for')
                    if len(parts) > 1:
                        client_name = parts[1].strip().split()[0].capitalize()
                
                import re
                amount_match = re.search(r'(\d+[.,]?\d*)', message)
                total = float(amount_match.group(1).replace(',', '.')) if amount_match else 100.0
                
                products = ["Produit(s) commandé(s)"]
                
                invoice = self.generate_invoice(client_name, products, total, language)
                return {
                    'response': invoice,
                    'success': True,
                    'language': language
                }
            
            # Vérifier si l'utilisateur demande des suggestions d'actions
            action_keywords = ['suggestion', 'action', 'recommande', 'recommend', 'dois-je faire', 'should i do', 'que faire', 'what to do', 'conseil', 'advice']
            if any(keyword in message_lower for keyword in action_keywords):
                suggestions = self.generate_actions(language)
                return {
                    'response': suggestions,
                    'success': True,
                    'language': language
                }
            
            # Vérifier si l'utilisateur demande un rapport
            report_keywords = ['rapport', 'report', 'résumé', 'summary', 'génère', 'generate']
            if any(keyword in message_lower for keyword in report_keywords):
                if 'vente' in message_lower or 'sales' in message_lower:
                    report = self.generate_report('sales', 'month', language)
                    return {
                        'response': report,
                        'success': True,
                        'language': language
                    }
                elif 'client' in message_lower:
                    report = self.generate_report('clients', 'month', language)
                    return {
                        'response': report,
                        'success': True,
                        'language': language
                    }
                elif 'produit' in message_lower or 'product' in message_lower:
                    report = self.generate_report('products', 'month', language)
                    return {
                        'response': report,
                        'success': True,
                        'language': language
                    }
            
            # Initialiser les outils avec Super Admin
            ai_tools = AITools(company_id, is_super_admin)
            data_context = get_data_context(ai_tools)
            
            system_prompt = self._get_system_prompt_with_context(language, data_context)
            
            messages = [{"role": "system", "content": system_prompt}]
            
            if context:
                context_msg = {
                    'french': f"Contexte: {context}",
                    'english': f"Context: {context}",
                    'wolof': f"Làkk: {context}"
                }.get(language, f"Context: {context}")
                messages.append({"role": "user", "content": context_msg})
            
            messages.append({"role": "user", "content": message})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024
            )
            
            return {
                'response': response.choices[0].message.content,
                'success': True,
                'language': language
            }
            
        except Exception as e:
            print(f" ERREUR: {e}")
            import traceback
            traceback.print_exc()
            return {
                'response': f" Erreur: {str(e)}",
                'success': False,
                'language': 'error'
            }
    
    def analyze_data(self, data, question, language='french'):
        if not self.enabled:
            return " Assistant non configuré"
        
        try:
            prompts = {
                'french': f"""Analyse les données suivantes :
                {data}
                
                Question : {question}
                
                Donne une analyse structurée avec des insights clairs.
                Réponds en français.""",
                
                'english': f"""Analyze the following data:
                {data}
                
                Question: {question}
                
                Provide a structured analysis with clear insights.
                Respond in English.""",
                
                'wolof': f"""Taarale ay xarala yi :
                {data}
                
                Laaj : {question}
                
                Jox ay xam-xam ak ay xibaar yu bari.
                Jox sa réponse ci Wolof."""
            }
            
            prompt = prompts.get(language, prompts['french'])
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1024
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f" Erreur: {str(e)}"